const db = require('../../database/db');

const LINKABLE_TYPES = ['vulnerability', 'vendor', 'vendor_risk', 'project'];
const RELATIONSHIP_TYPES = [
    'related_to',
    'tracked_in',
    'addressed_by',
    'has_risk',
    'depends_on',
    'identifies',
    'relevant_to'
];

const badRequest = (status, message) => Promise.reject({ status, message });

// Each descriptor returns the display fields for records of that type.
const describers = {
    vulnerability: (ids) => db.query(
        `SELECT vulnerability_id AS record_id, title, status, contextual_severity AS level, NULL AS parent_name
         FROM vulnerabilities WHERE vulnerability_id IN (?)`, [ids]),
    vendor: (ids) => db.query(
        `SELECT v.vendor_id AS record_id, v.name AS title, NULL AS status, v.criticality AS level, NULL AS parent_name
         FROM vendors v WHERE v.vendor_id IN (?)`, [ids]),
    vendor_risk: (ids) => db.query(
        `SELECT r.vendor_risk_id AS record_id, r.title, r.status, r.risk_level AS level,
                v.name AS parent_name, r.vendor_id AS parent_id
         FROM vendor_risks r JOIN vendors v ON v.vendor_id = r.vendor_id
         WHERE r.vendor_risk_id IN (?)`, [ids]),
    project: (ids) => db.query(
        `SELECT project_id AS record_id, title, status, NULL AS level, NULL AS parent_name
         FROM projects WHERE project_id IN (?)`, [ids])
};

const describeRecords = async (refs) => {
    const described = new Map();
    const byType = {};
    for (const ref of refs) {
        if (!describers[ref.type]) continue;
        (byType[ref.type] ||= new Set()).add(ref.id);
    }
    await Promise.all(Object.entries(byType).map(async ([type, ids]) => {
        const [rows] = await describers[type]([...ids]);
        rows.forEach((row) => described.set(`${type}:${row.record_id}`, { record_type: type, ...row }));
    }));
    return described;
};

const recordExists = (type, id) => describers[type]([id]).then(([rows]) => rows.length > 0);

const fetchRelationships = () => db.query('SELECT * FROM record_relationships').then(([rows]) => rows);

const fetchRelationshipById = (record_relationship_id) => db.query(
    'SELECT * FROM record_relationships WHERE record_relationship_id = ?',
    [record_relationship_id]
).then(([rows]) => rows[0]);

const addRelationship = async ({
    source_record_type,
    source_record_id,
    target_record_type,
    target_record_id,
    relationship_type,
    created_by
}) => {
    const sourceId = Number(source_record_id);
    const targetId = Number(target_record_id);

    for (const [type, id] of [[source_record_type, sourceId], [target_record_type, targetId]]) {
        if (!LINKABLE_TYPES.includes(type)) {
            return badRequest(400, `Record type must be one of: ${LINKABLE_TYPES.join(', ')}.`);
        }
        if (!Number.isInteger(id) || id < 1) return badRequest(400, 'Record ids must be positive integers.');
    }
    if (!RELATIONSHIP_TYPES.includes(relationship_type)) {
        return badRequest(400, `Relationship type must be one of: ${RELATIONSHIP_TYPES.join(', ')}.`);
    }
    if (source_record_type === target_record_type && sourceId === targetId) {
        return badRequest(400, 'A record cannot be linked to itself.');
    }

    const [sourceFound, targetFound] = await Promise.all([
        recordExists(source_record_type, sourceId),
        recordExists(target_record_type, targetId)
    ]);
    if (!sourceFound || !targetFound) return badRequest(404, 'One of the records to link was not found.');

    const [existing] = await db.query(
        `SELECT record_relationship_id FROM record_relationships
         WHERE relationship_type = ? AND (
            (source_record_type = ? AND source_record_id = ? AND target_record_type = ? AND target_record_id = ?)
            OR (source_record_type = ? AND source_record_id = ? AND target_record_type = ? AND target_record_id = ?))`,
        [
            relationship_type,
            source_record_type, sourceId, target_record_type, targetId,
            target_record_type, targetId, source_record_type, sourceId
        ]
    );
    if (existing.length > 0) return badRequest(409, 'These records are already linked in this way.');

    const [result] = await db.query(
        `INSERT INTO record_relationships
         (source_record_type, source_record_id, target_record_type, target_record_id, relationship_type, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [source_record_type, sourceId, target_record_type, targetId, relationship_type, created_by]
    );
    return fetchRelationshipById(result.insertId);
};

const removeRelationship = (record_relationship_id) => db.query(
    'DELETE FROM record_relationships WHERE record_relationship_id = ?',
    [record_relationship_id]
).then(([result]) => result.affectedRows);

// Called when a record is deleted so no dangling links remain.
const removeRelationshipsForRecord = (record_type, record_id) => db.query(
    `DELETE FROM record_relationships
     WHERE (source_record_type = ? AND source_record_id = ?)
        OR (target_record_type = ? AND target_record_id = ?)`,
    [record_type, record_id, record_type, record_id]
);

const fetchRelationshipsByRecord = (record_type, record_id) => db.query(
    `SELECT * FROM record_relationships
     WHERE (source_record_type = ? AND source_record_id = ?)
        OR (target_record_type = ? AND target_record_id = ?)
     ORDER BY created_at DESC, record_relationship_id DESC`,
    [record_type, record_id, record_type, record_id]
).then(([rows]) => rows);

// Links as seen from one record: the other record is described, and direction says which way the link points.
const fetchLinksByRecord = async (record_type, record_id) => {
    const relationships = await fetchRelationshipsByRecord(record_type, record_id);
    const others = relationships.map((rel) => {
        const isSource = rel.source_record_type === record_type && rel.source_record_id === record_id;
        return {
            rel,
            direction: isSource ? 'outgoing' : 'incoming',
            type: isSource ? rel.target_record_type : rel.source_record_type,
            id: isSource ? rel.target_record_id : rel.source_record_id
        };
    }).filter((item) => LINKABLE_TYPES.includes(item.type));

    const described = await describeRecords(others);

    return others
        .filter((item) => described.has(`${item.type}:${item.id}`))
        .map((item) => ({
            record_relationship_id: item.rel.record_relationship_id,
            relationship_type: item.rel.relationship_type,
            direction: item.direction,
            created_at: item.rel.created_at,
            record: described.get(`${item.type}:${item.id}`)
        }));
};

const fetchLinkableRecords = async (record_type) => {
    if (!LINKABLE_TYPES.includes(record_type)) {
        return badRequest(400, `Record type must be one of: ${LINKABLE_TYPES.join(', ')}.`);
    }
    const queries = {
        vulnerability: 'SELECT vulnerability_id AS record_id FROM vulnerabilities',
        vendor: 'SELECT vendor_id AS record_id FROM vendors',
        vendor_risk: 'SELECT vendor_risk_id AS record_id FROM vendor_risks',
        project: 'SELECT project_id AS record_id FROM projects'
    };
    const [idRows] = await db.query(queries[record_type]);
    if (idRows.length === 0) return [];
    const [rows] = await describers[record_type](idRows.map((row) => row.record_id));
    return rows.map((row) => ({ record_type, ...row })).sort((a, b) => a.title.localeCompare(b.title));
};

const fetchStatusHistoryByRecord = (record_type, record_id) => db.query(
    `SELECT h.*, u.username
     FROM status_history h LEFT JOIN users u ON u.user_id = h.user_id
     WHERE h.record_type = ? AND h.record_id = ?
     ORDER BY h.changed_at DESC, h.status_history_id DESC`,
    [record_type, record_id]
).then(([rows]) => rows);

module.exports = {
    LINKABLE_TYPES,
    RELATIONSHIP_TYPES,
    fetchRelationships,
    fetchRelationshipById,
    addRelationship,
    removeRelationship,
    removeRelationshipsForRecord,
    fetchRelationshipsByRecord,
    fetchLinksByRecord,
    fetchLinkableRecords,
    fetchStatusHistoryByRecord
};
