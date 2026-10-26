CREATE TABLE IF NOT EXISTS report_soc (
    report_soc_id INT AUTO_INCREMENT PRIMARY KEY,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    summary TEXT NULL,
    screenshot_filename VARCHAR(255) NULL,
    updated_by INT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_report_soc_period (period_start, period_end)
);

CREATE TABLE IF NOT EXISTS phishing_campaign_results (
    phishing_campaign_result_id INT AUTO_INCREMENT PRIMARY KEY,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    team VARCHAR(100) NOT NULL,
    learners INT UNSIGNED NOT NULL,
    open_rate DECIMAL(5,2) NOT NULL,
    phish_rate DECIMAL(5,2) NOT NULL,
    created_by INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_phishing_period (period_start, period_end)
);

CREATE TABLE IF NOT EXISTS ticket_monthly_stats (
    month DATE NOT NULL PRIMARY KEY,
    total_opened INT UNSIGNED NULL,
    updated_by INT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_category_counts (
    month DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    ticket_count INT UNSIGNED NOT NULL,
    PRIMARY KEY (month, category)
);
