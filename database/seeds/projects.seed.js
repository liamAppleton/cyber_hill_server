const db = require('../db')

const createProjects = (projectsData) => {
    return db.query(`
        CREATE TABLE IF NOT EXISTS projects (
            project_id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL UNIQUE,
            description TEXT,
            status ENUM(
                'not_started',
                'in_progress',
                'on_hold',
                'completed',
                'cancelled'
            ) NOT NULL DEFAULT 'not_started',
            start_date DATE,
            target_date DATE,
            completed_at TIMESTAMP NULL DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP
        );
    `).then(() => {
        return Promise.all(
            projectsData.map(project => {
                return db.query(
                    `INSERT INTO projects (
                        title,
                        description,
                        status,
                        start_date,
                        target_date,
                        completed_at
                    ) VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        project.title,
                        project.description,
                        project.status,
                        project.start_date,
                        project.target_date,
                        project.completed_at
                    ]
                );
            })
        );
    });
};

const createProjectNotes = (projectNotesData) => {
    return db.query(`
        CREATE TABLE IF NOT EXISTS project_notes (
            project_note_id INT AUTO_INCREMENT PRIMARY KEY,
            project_id INT NOT NULL,
            body TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id INT NOT NULL,
            FOREIGN KEY (project_id)
                REFERENCES projects(project_id)
                ON DELETE CASCADE,
            FOREIGN KEY (user_id)
                REFERENCES users(user_id)
                ON DELETE CASCADE
        );
    `).then(() => {
        return Promise.all(
            projectNotesData.map(note => {
                return db.query(
                    `INSERT INTO project_notes (
                        project_id,
                        body,
                        user_id
                    ) VALUES (?, ?, ?)`,
                    [
                        note.project_id,
                        note.body,
                        note.user_id
                    ]
                );
            })
        );
    });
};

module.exports = {
    createProjects,
    createProjectNotes
}