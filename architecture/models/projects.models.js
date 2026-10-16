const db = require('../../database/db');

const fetchProjects = () => {
    return db.query('SELECT * FROM projects')
        .then(([rows]) => {
            return rows;
        })
}

const fetchProjectById = (project_id) => {
    return db.query('SELECT * FROM projects WHERE project_id = ?', [project_id])
        .then(([rows]) => {
            return rows[0]
        })
        .catch((err) => {
            next(err)
        })
}

const addProject = (title, description, status, start_date, target_date) => {
    const queryValues = [ title, description, status, start_date, target_date ];

    const queryString = `
    INSERT INTO projects
    (title, description, status, start_date, target_date)
    VALUES (?, ?, ?, ?, ?)`;

    return db.query(queryString, queryValues)
        .then(([result]) => {
            fetchProjectById(result.insertId)
        })
}

const updateProject = (project_id, updates) => {
    const allowedFields = [ 
        "title",
        "description",
        "target_date"
    ];

    const fields = [];
    const values = [];

    const invalidFields = Object.keys(updates)
        .filter((field) => !allowedFields.includes(field))
    
    if (invalidFields.length > 0) {
        return Promise.reject(
            new Error(
                `Invalid fields provided: ${invalidFields.join(', ')}`
            )
        )
    }

    if (
        updates.title !== undefined &&
        (
            typeof updates.title !== 'string' ||
            updates.title.trim().length === 0
        )
    ) {
        return Promise.reject(
            new Error('Title must be a non-empty string')
        );
    }

    if (
        updates.description !== undefined &&
        updates.description !== null &&
        typeof updates.description !== 'string'
    ) {
        return Promise.reject(
            new Error('Description must be a string or null')
        );
    }

    if (updates.target_date !== undefined) {
        const date = updates.target_date;

        if (
            typeof date !== 'string' ||
            !/^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}:\d{2})?$/.test(date) ||
            Number.isNaN(Date.parse(date))
        ) {
            return Promise.reject(
                new Error(
                    'target_date must be a valid date in YYYY-MM-DD or YYYY-MM-DD HH:MM:SS format'
                )
            );
        }
    }

    for (const field of allowedFields) {
        if (updates[field] !== undefined) {
            fields.push(`\`${field}\` = ?`);
            values.push(
                field === 'title'
                    ? updates[field].trim()
                    : updates[field]
            );
        }
    }

    if (fields.length === 0) {
        return Promise.reject(
            new Error('No valid fields provided to update')
        );
    }

    values.push(project_id);

    const query = `
        UPDATE projects
        SET ${fields.join(', ')}
        WHERE project_id = ?
    `;

    return db.query(query, values);
}

const updateProjectStatus = (project_id, status) => {
    const allowedValues = [
        'not_started',
        'in_progress',
        'on_hold',
        'completed',
        'cancelled'
    ];

    if (!allowedValues.includes(status)) {
        return Promise.reject({
            status: 400,
            message: `Invalid project status: ${status}`
        })
    };

    const queryString = `
    UPDATE projects
    SET status = ?
    WHERE project_id = ?`;

    return db.query(queryString, [status, project_id])
}

const removeProject = (project_id) => {
    return db.query('DELETE FROM projects WHERE project_id = ?', [project_id])
        .then(([result]) => {
            return result.affectedRows
        })
}

const fetchProjectNotesById = (project_id) => {
    return db.query('SELECT * FROM project_notes WHERE project_id = ?', [project_id])
        .then(([rows]) => {
            return rows
        })
}

const addProjectNote = (project_id, body, user_id) => {
    const queryValues = [ project_id, body, user_id];

    const queryString = `
    INSERT INTO project_notes
    (project_id, body, user_id)
    VALUES (?, ?, ?)`
    
    return db.query(queryString, queryValues)
}

const fetchRelationshipsByProjectId = (project_id) => {
    const queryString = `
        SELECT * FROM record_relationships
        WHERE (
            source_record_type = 'project'
            AND source_record_id = ?
        )
        OR (
            target_record_type = 'project'
            AND target_record_id = ?
        )`;

    return db.query(queryString, [project_id, project_id])
        .then(([rows]) => {
            console.log(rows)
            return rows
        })
}

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