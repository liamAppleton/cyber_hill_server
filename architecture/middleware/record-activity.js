const db = require('../../database/db');

// Records an audit_log entry (and a status_history entry when a status changes)
// for every successful write request, so history is captured in one place.
const RESOURCES = {
    vulnerabilities: { type: 'vulnerability', table: 'vulnerabilities', pk: 'vulnerability_id', label: 'title', hasStatus: true },
    vendors: { type: 'vendor', table: 'vendors', pk: 'vendor_id', label: 'name', hasStatus: false },
    'vendor-risks': { type: 'vendor_risk', table: 'vendor_risks', pk: 'vendor_risk_id', label: 'title', hasStatus: true },
    projects: { type: 'project', table: 'projects', pk: 'project_id', label: 'title', hasStatus: true },
    'vulnerability-assets': { type: 'vulnerability_asset', table: 'vulnerability_assets', pk: 'vulnerability_asset_id', label: null, hasStatus: true }
};

const IGNORED_COLUMNS = new Set(['updated_at', 'created_at']);
const MUTATING = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

const loadRow = async (resource, id) => {
    const [rows] = await db.query(`SELECT * FROM ${resource.table} WHERE ${resource.pk} = ?`, [id]);
    return rows[0] || null;
};

const describe = (resource, row) => {
    if (!row) return '';
    return resource.label ? `"${row[resource.label]}"` : `#${row[resource.pk]}`;
};

const changedFields = (before, after) => Object.keys(after)
    .filter((key) => !IGNORED_COLUMNS.has(key) && String(before[key] ?? '') !== String(after[key] ?? ''))
    .map((key) => `${key}: ${before[key] ?? 'empty'} -> ${after[key] ?? 'empty'}`);

const writeAudit = (type, id, action, userId, details) => db.query(
    'INSERT INTO audit_log (record_type, record_id, action, user_id, change_details) VALUES (?, ?, ?, ?, ?)',
    [type, id, action, userId, details ? String(details).slice(0, 2000) : null]
);

const writeStatus = (type, id, previous, next, userId, reason) => db.query(
    'INSERT INTO status_history (record_type, record_id, previous_status, new_status, user_id, reason) VALUES (?, ?, ?, ?, ?, ?)',
    [type, id, previous, next, userId, reason || null]
);

const findCreatedId = (body, pk) => {
    if (!body || typeof body !== 'object') return null;
    for (const value of Object.values(body)) {
        if (value && typeof value === 'object' && value[pk] !== undefined) return value[pk];
    }
    return body[pk] ?? null;
};

const parseRequest = (req) => {
    const [, collection, id, sub] = req.path.split('/');
    return { collection, id: /^\d+$/.test(id || '') ? Number(id) : null, sub };
};

const recordActivity = async (req, res, next) => {
    if (!MUTATING.has(req.method) || !req.user) return next();

    const { collection, id, sub } = parseRequest(req);
    const resource = RESOURCES[collection];
    const isRelationship = collection === 'relationships';
    const isImport = collection === 'vulnerability-imports';
    if (!resource && !isRelationship && !isImport) return next();

    const userId = req.user.user_id;
    const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : null;
    let before = null;
    let removedLink = null;

    try {
        if (resource && id) before = await loadRow(resource, id);
        if (isRelationship && req.method === 'DELETE' && id) {
            const [rows] = await db.query('SELECT * FROM record_relationships WHERE record_relationship_id = ?', [id]);
            removedLink = rows[0] || null;
        }
    } catch (err) {
        console.error('record-activity: could not read prior state', err.message);
    }

    let responseBody = null;
    const originalSend = res.send.bind(res);
    res.send = (body) => {
        if (typeof body === 'string') {
            try { responseBody = JSON.parse(body); } catch (e) { responseBody = null; }
        } else {
            responseBody = body;
        }
        return originalSend(body);
    };

    res.on('finish', async () => {
        if (res.statusCode < 200 || res.statusCode >= 300) return;
        try {
            if (resource) {
                await logResourceActivity({ req, resource, id, sub, before, responseBody, userId, reason });
            } else if (isRelationship) {
                await logRelationshipActivity({ req, removedLink, responseBody, userId });
            } else {
                await logImportActivity({ req, id, sub, responseBody, userId });
            }
        } catch (err) {
            console.error('record-activity: could not record activity', err.message);
        }
    });

    next();
};

const logResourceActivity = async ({ req, resource, id, sub, before, responseBody, userId, reason }) => {
    const { type } = resource;

    if (req.method === 'POST' && !id) {
        const newId = findCreatedId(responseBody, resource.pk);
        if (!newId) return;
        const after = await loadRow(resource, newId);
        await writeAudit(type, newId, 'record_created', userId, `Created ${type.replace('_', ' ')} ${describe(resource, after)}.`);
        if (resource.hasStatus && after?.status) await writeStatus(type, newId, null, after.status, userId, 'Record created');
        return;
    }
    if (!id) return;

    if (req.method === 'DELETE') {
        await writeAudit(type, id, 'record_deleted', userId, `Deleted ${type.replace('_', ' ')} ${describe(resource, before)}.`);
        return;
    }

    if (sub === 'notes') {
        await writeAudit(type, id, 'note_added', userId, 'Added a note.');
        return;
    }
    if (sub === 'assets') {
        await writeAudit(type, id, 'assets_added', userId, 'Added affected assets.');
        return;
    }

    if (!sub && req.method !== 'GET') {
        const after = await loadRow(resource, id);
        if (!before || !after) return;
        const changes = changedFields(before, after);
        if (resource.hasStatus && before.status !== after.status) {
            await writeStatus(type, id, before.status, after.status, userId, reason);
        }
        if (changes.length) await writeAudit(type, id, 'record_updated', userId, changes.join('; '));
        return;
    }

    if (sub === 'status') {
        const after = await loadRow(resource, id);
        if (!before || !after) return;
        if (before.status !== after.status) {
            await writeStatus(type, id, before.status, after.status, userId, reason);
            await writeAudit(type, id, 'status_changed', userId, `status: ${before.status} -> ${after.status}`);
        }
    }
};

const logRelationshipActivity = async ({ req, removedLink, responseBody, userId }) => {
    let link = removedLink;
    let action = 'link_removed';
    if (req.method === 'POST') {
        link = findCreatedId(responseBody, 'record_relationship_id') ? (responseBody.relationship || Object.values(responseBody)[0]) : req.body;
        action = 'link_created';
    }
    if (!link) return;
    const source = [link.source_record_type, Number(link.source_record_id)];
    const target = [link.target_record_type, Number(link.target_record_id)];
    const detail = `${link.relationship_type}: ${source[0]} #${source[1]} -> ${target[0]} #${target[1]}`;
    await writeAudit(source[0], source[1], action, userId, detail);
    await writeAudit(target[0], target[1], action, userId, detail);
};

const logImportActivity = async ({ req, id, sub, responseBody, userId }) => {
    if (req.method !== 'POST') return;
    if (!id) {
        const newId = findCreatedId(responseBody, 'vulnerability_import_id');
        if (newId) await writeAudit('vulnerability_import', newId, 'import_uploaded', userId, 'Uploaded a vulnerability import.');
        return;
    }
    if (sub === 'promote' || sub === 'discard') {
        await writeAudit('vulnerability_import', id, sub === 'promote' ? 'findings_approved' : 'findings_discarded', userId,
            responseBody ? JSON.stringify(responseBody) : null);
    }
};

module.exports = { recordActivity };
