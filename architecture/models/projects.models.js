const db = require('../../database/db');
const { removeRelationshipsForRecord } = require('./recordRelationships.models');

const STATUSES = ['not_started', 'in_progress', 'on_hold', 'completed', 'cancelled'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const badRequest = (message) => Promise.reject({ status: 400, message });

const isValidDate = (value) => typeof value === 'string'
    && DATE_PATTERN.test(value)
    && !Number.isNaN(Date.parse(value));

const projectSelect = `
    SELECT p.*,
        (SELECT COUNT(*) FROM project_notes n WHERE n.project_id = p.project_id) AS note_count
    FROM projects p`;

const fetchProjects = () => {
    return db.query(`${projectSelect} ORDER BY p.created_at DESC, p.project_id DESC`)
        .then(([rows]) => rows);
};

const fetchProjectById = (project_id) => {
    return db.query(`${projectSelect} WHERE p.project_id = ?`, [project_id])
        .then(([rows]) => rows[0]);
};

const validateProject = (values, { partial }) => {
    const { title, description, status, start_date, target_date } = values;

    if (!partial || title !== undefined) {
        if (typeof title !== 'string' || title.trim().length === 0 || title.trim().length > 255) {
            return 'Title is required (max 255 characters).';
        }
    }
    if (description !== undefined && description !== null && typeof description !== 'string') {
        return 'Description must be a string.';
    }
    if (status !== undefined && !STATUSES.includes(status)) {
        return `Status must be one of: ${STATUSES.join(', ')}.`;
    }
    for (const [name, value] of [['start_date', start_date], ['target_date', target_date]]) {
        if (value !== undefined && value !== null && value !== '' && !isValidDate(value)) {
            return `${name} must be a valid date in YYYY-MM-DD format.`;
        }
    }
    if (start_date && target_date && target_date < start_date) {
        return 'Target date cannot be before the start date.';
    }
    return null;
};

const emptyToNull = (value) => (value === '' || value === undefined ? null : value);

const addProject = (values = {}) => {
    const problem = validateProject(values, { partial: false });
    if (problem) return badRequest(problem);

    const status = values.status || 'not_started';

    return db.query(
        `INSERT INTO projects (title, description, status, start_date, target_date, completed_at)
         VALUES (?, ?, ?, ?, ?, ${status === 'completed' ? 'NOW()' : 'NULL'})`,
        [
            values.title.trim(),
            emptyToNull(values.description),
            status,
            emptyToNull(values.start_date),
            emptyToNull(values.target_date)
        ]
    ).then(([result]) => fetchProjectById(result.insertId));
};

const updateProject = (project_id, updates = {}) => {
    const allowedFields = ['title', 'description', 'start_date', 'target_date'];
    const invalidFields = Object.keys(updates).filter((field) => !allowedFields.includes(field));

    if (invalidFields.length > 0) return badRequest(`Invalid fields provided: ${invalidFields.join(', ')}`);
    if (Object.keys(updates).length === 0) return badRequest('No valid fields provided to update.');

    const problem = validateProject(updates, { partial: true });
    if (problem) return badRequest(problem);

    const fields = [];
    const values = [];
    for (const field of allowedFields) {
        if (updates[field] !== undefined) {
            fields.push(`\`${field}\` = ?`);
            values.push(field === 'title' ? updates.title.trim() : emptyToNull(updates[field]));
        }
    }

    return db.query(`UPDATE projects SET ${fields.join(', ')} WHERE project_id = ?`, [...values, project_id])
        .then(([result]) => (result.affectedRows ? fetchProjectById(project_id) : undefined));
};

const updateProjectStatus = (project_id, status) => {
    if (!STATUSES.includes(status)) return badRequest(`Status must be one of: ${STATUSES.join(', ')}.`);

    return db.query(
        `UPDATE projects
         SET status = ?,
             completed_at = CASE
                 WHEN ? = 'completed' THEN COALESCE(completed_at, NOW())
                 ELSE NULL
             END
         WHERE project_id = ?`,
        [status, status, project_id]
    ).then(([result]) => (result.affectedRows ? fetchProjectById(project_id) : undefined));
};

const removeProject = (project_id) => {
    return db.query('DELETE FROM projects WHERE project_id = ?', [project_id])
        .then(([result]) => {
            if (result.affectedRows) return removeRelationshipsForRecord('project', project_id).then(() => result.affectedRows);
            return result.affectedRows;
        });
};

const noteSelect = `
    SELECT n.*, u.username
    FROM project_notes n
    LEFT JOIN users u ON u.user_id = n.user_id`;

const fetchProjectNotesById = (project_id) => {
    return db.query(`${noteSelect} WHERE n.project_id = ? ORDER BY n.created_at DESC, n.project_note_id DESC`, [project_id])
        .then(([rows]) => rows);
};

const addProjectNote = (project_id, body, user_id) => {
    if (typeof body !== 'string' || body.trim().length === 0) return badRequest('Note body is required.');

    return db.query(
        'INSERT INTO project_notes (project_id, body, user_id) VALUES (?, ?, ?)',
        [project_id, body.trim(), user_id]
    ).then(([result]) => db.query(`${noteSelect} WHERE n.project_note_id = ?`, [result.insertId]))
        .then(([rows]) => rows[0]);
};

const fetchRelationshipsByProjectId = (project_id) => {
    const queryString = `
        SELECT * FROM record_relationships
        WHERE (source_record_type = 'project' AND source_record_id = ?)
        OR (target_record_type = 'project' AND target_record_id = ?)`;

    return db.query(queryString, [project_id, project_id]).then(([rows]) => rows);
};

module.exports = {
    fetchProjects,
    fetchProjectById,
    addProject,
    updateProject,
    updateProjectStatus,
    removeProject,
    fetchProjectNotesById,
    addProjectNote,
    fetchRelationshipsByProjectId
};
