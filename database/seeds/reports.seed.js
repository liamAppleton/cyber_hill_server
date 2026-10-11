
const db = require('../db');

const createReports = (reportsData) => {
    return db.query(`
        CREATE TABLE IF NOT EXISTS reports (
            report_id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            report_type VARCHAR(100) NOT NULL,
            period_start DATE,
            period_end DATE,
            generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by INT NOT NULL,
            report_status ENUM(
                'draft',
                'generating',
                'completed',
                'failed'
            ) NOT NULL DEFAULT 'draft',
            report_content LONGTEXT,
            file_location VARCHAR(500),
            FOREIGN KEY (created_by)
                REFERENCES users(user_id)
                ON DELETE CASCADE
        );
    `).then(() => {
        return Promise.all(
            reportsData.map(report => {
                return db.query(
                    `INSERT INTO reports (
                        title,
                        report_type,
                        period_start,
                        period_end,
                        generated_at,
                        created_by,
                        report_status,
                        report_content,
                        file_location
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        report.title,
                        report.report_type,
                        report.period_start,
                        report.period_end,
                        report.generated_at,
                        report.created_by,
                        report.report_status,
                        report.report_content,
                        report.file_location
                    ]
                );
            })
        );
    });
};

module.exports = createReports;
