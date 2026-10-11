const db = require('../db.js');

const createThreatArticles = (threatArticlesData) => {
    return db.query(`
        CREATE TABLE IF NOT EXISTS threat_articles (
            threat_article_id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(500) NOT NULL,
            description TEXT,
            article_url VARCHAR(2048) NOT NULL UNIQUE,
            source VARCHAR(255) NOT NULL,
            date_published DATETIME,
            date_ingested TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            threat_score DECIMAL(5, 2) NOT NULL DEFAULT 0,
            severity ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'low',
            status ENUM('new', 'tracking', 'resolved', 'dismissed') NOT NULL DEFAULT 'new',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `).then(async () => {
        for (const article of threatArticlesData) {
            await db.query(
                `INSERT INTO threat_articles (
                    title,
                    description,
                    article_url,
                    source,
                    date_published,
                    date_ingested,
                    threat_score,
                    severity,
                    status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    article.title,
                    article.description,
                    article.article_url,
                    article.source,
                    article.date_published,
                    article.date_ingested,
                    article.threat_score,
                    article.severity,
                    article.status
                ]
            );
        }
    });
};

module.exports = createThreatArticles;