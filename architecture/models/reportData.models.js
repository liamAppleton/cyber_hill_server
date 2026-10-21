const db = require('../../database/db');

const dateRange = (column, periodEndExclusive) => (
    `${column} >= ?${periodEndExclusive ? ` AND ${column} < ?` : ''}`
);

const dateRangeValues = (periodStart, periodEndExclusive) => (
    periodEndExclusive
        ? [periodStart, periodEndExclusive]
        : [periodStart]
);

const fetchVulnerabilitySummaryData = (periodStart, periodEndExclusive) => {
    const periodValues = dateRangeValues(periodStart, periodEndExclusive);

    return Promise.all([
        db.query(`
            SELECT
                vulnerability_id,
                COALESCE(contextual_severity, scanner_severity) AS severity
            FROM vulnerabilities
            WHERE status IN ('Open', 'In Progress')
        `),
        db.query(`
            SELECT
                vulnerability_id,
                title,
                description,
                cve,
                COALESCE(contextual_severity, scanner_severity) AS severity,
                status,
                date_discovered
            FROM vulnerabilities
            WHERE status IN ('Open', 'In Progress')
                AND COALESCE(contextual_severity, scanner_severity) IN ('Critical', 'High')
            ORDER BY
                CASE COALESCE(contextual_severity, scanner_severity)
                    WHEN 'Critical' THEN 1
                    WHEN 'High' THEN 2
                    ELSE 3
                END,
                date_discovered ASC
            LIMIT 5
        `),
        db.query(`
            SELECT COUNT(*) AS count
            FROM vulnerabilities
            WHERE ${dateRange('date_discovered', periodEndExclusive)}
        `, periodValues),
        db.query(`
            SELECT COUNT(*) AS count
            FROM (
                SELECT vulnerability_id AS record_id
                FROM vulnerabilities
                WHERE ${dateRange('resolved_at', periodEndExclusive)}

                UNION

                SELECT record_id
                FROM status_history
                WHERE record_type = 'vulnerability'
                    AND new_status = 'Resolved'
                    AND ${dateRange('changed_at', periodEndExclusive)}
            ) AS remediated_vulnerabilities
        `, [...periodValues, ...periodValues])
    ]).then(([
        [openVulnerabilities],
        [priorityVulnerabilities],
        [identifiedRows],
        [remediatedRows]
    ]) => ({
        open_vulnerabilities: openVulnerabilities,
        priority_vulnerabilities: priorityVulnerabilities,
        identified_during_period: identifiedRows[0].count,
        remediated_during_period: remediatedRows[0].count
    }));
};

const fetchVendorRiskReportData = (periodStart, periodEndExclusive) => {
    const periodValues = dateRangeValues(periodStart, periodEndExclusive);

    return Promise.all([
        db.query('SELECT COUNT(*) AS count FROM vendors'),
        db.query(`
            SELECT risk_level
            FROM vendor_risks
            WHERE status IN ('open', 'in_progress')
        `),
        db.query(`
            SELECT
                vr.vendor_risk_id,
                vr.title,
                vr.description,
                vr.risk_level,
                vr.status,
                vr.date_identified,
                v.name AS vendor_name
            FROM vendor_risks vr
            JOIN vendors v ON v.vendor_id = vr.vendor_id
            WHERE vr.status IN ('open', 'in_progress')
                AND vr.risk_level IN ('critical', 'high')
            ORDER BY
                CASE vr.risk_level
                    WHEN 'critical' THEN 1
                    WHEN 'high' THEN 2
                    ELSE 3
                END,
                vr.date_identified ASC
            LIMIT 5
        `),
        db.query(`
            SELECT COUNT(*) AS count
            FROM vendor_risks
            WHERE ${dateRange('created_at', periodEndExclusive)}
        `, periodValues),
        db.query(`
            SELECT COUNT(*) AS count
            FROM (
                SELECT vendor_risk_id AS record_id
                FROM vendor_risks
                WHERE ${dateRange('resolved_at', periodEndExclusive)}

                UNION

                SELECT record_id
                FROM status_history
                WHERE record_type = 'vendor_risk'
                    AND new_status IN ('resolved', 'accepted')
                    AND ${dateRange('changed_at', periodEndExclusive)}
            ) AS closed_vendor_risks
        `, [...periodValues, ...periodValues])
    ]).then(([
        [vendorCountRows],
        [openRisks],
        [priorityRisks],
        [createdRiskRows],
        [closedRiskRows]
    ]) => ({
        total_vendors: vendorCountRows[0].count,
        open_risks: openRisks,
        priority_risks: priorityRisks,
        risks_created_during_period: createdRiskRows[0].count,
        risks_closed_during_period: closedRiskRows[0].count
    }));
};

const fetchProjectStatusData = () => {
    return db.query(`
        SELECT
            project_id,
            title,
            description,
            status,
            start_date,
            target_date,
            completed_at,
            created_at,
            updated_at
        FROM projects
        ORDER BY
            CASE status
                WHEN 'on_hold' THEN 1
                WHEN 'in_progress' THEN 2
                WHEN 'not_started' THEN 3
                ELSE 4
            END,
            target_date ASC
    `)
        .then(([rows]) => rows);
};

const fetchSecurityActivityData = (periodStart, periodEndExclusive) => {
    const periodValues = dateRangeValues(periodStart, periodEndExclusive);

    return Promise.all([
        db.query(`
            SELECT COUNT(*) AS count
            FROM audit_log
            WHERE ${dateRange('changed_at', periodEndExclusive)}
        `, periodValues),
        db.query(`
            SELECT COUNT(*) AS count
            FROM status_history
            WHERE ${dateRange('changed_at', periodEndExclusive)}
        `, periodValues),
        db.query(`
            SELECT COUNT(DISTINCT record_id) AS count
            FROM audit_log
            WHERE record_type = 'project'
                AND action IN (
                    'record_updated',
                    'status_changed',
                    'project_completed',
                    'project_cancelled'
                )
                AND ${dateRange('changed_at', periodEndExclusive)}
        `, periodValues),
        db.query(`
            SELECT
                record_type,
                record_id,
                action,
                changed_at,
                change_details
            FROM audit_log
            WHERE ${dateRange('changed_at', periodEndExclusive)}
            ORDER BY changed_at DESC, audit_log_id DESC
            LIMIT 5
        `, periodValues),
        db.query(`
            SELECT
                record_type,
                record_id,
                previous_status,
                new_status,
                changed_at,
                reason
            FROM status_history
            WHERE ${dateRange('changed_at', periodEndExclusive)}
            ORDER BY changed_at DESC, status_history_id DESC
            LIMIT 5
        `, periodValues)
    ]).then(([
        [auditEventRows],
        [statusChangeRows],
        [updatedProjectRows],
        [recentAuditEvents],
        [recentStatusChanges]
    ]) => ({
        audit_events: auditEventRows[0].count,
        status_changes: statusChangeRows[0].count,
        security_projects_updated: updatedProjectRows[0].count,
        recent_audit_events: recentAuditEvents,
        recent_status_changes: recentStatusChanges
    }));
};

const fetchThreatIntelligenceData = (periodStart, periodEndExclusive) => {
    const periodValues = dateRangeValues(periodStart, periodEndExclusive);

    return Promise.all([
        db.query(`
            SELECT COUNT(*) AS count
            FROM threat_articles
            WHERE ${dateRange('date_ingested', periodEndExclusive)}
        `, periodValues),
        db.query(`
            SELECT COUNT(*) AS count
            FROM threat_articles
            WHERE status = 'tracking'
        `),
        db.query(`
            SELECT
                threat_article_id,
                title,
                description,
                source,
                severity,
                status,
                threat_score,
                date_ingested
            FROM threat_articles
            WHERE ${dateRange('date_ingested', periodEndExclusive)}
                AND status IN ('new', 'tracking')
            ORDER BY
                CASE severity
                    WHEN 'critical' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    ELSE 4
                END,
                threat_score DESC,
                date_ingested DESC
            LIMIT 5
        `, periodValues)
    ]).then(([
        [collectedRows],
        [relevantRows],
        [priorityArticles]
    ]) => ({
        articles_collected_during_period: collectedRows[0].count,
        relevant_articles: relevantRows[0].count,
        priority_articles: priorityArticles
    }));
};

const fetchThreatArticleTrends = (periodStart, periodEndExclusive) => {
    const periodValues = dateRangeValues(periodStart, periodEndExclusive);

    return db.query(`
        SELECT
            DATE_FORMAT(date_ingested, '%Y-%m') AS month,
            severity,
            COUNT(*) AS count
        FROM threat_articles
        WHERE ${dateRange('date_ingested', periodEndExclusive)}
        GROUP BY DATE_FORMAT(date_ingested, '%Y-%m'), severity
        ORDER BY month ASC
    `, periodValues).then(([rows]) => rows);
};

const fetchProjectActivityData = (periodStart, periodEndExclusive) => {
    const periodValues = dateRangeValues(periodStart, periodEndExclusive);

    return Promise.all([
        db.query(`
            SELECT COUNT(DISTINCT record_id) AS count
            FROM audit_log
            WHERE record_type = 'project'
                AND action IN (
                    'record_updated',
                    'status_changed',
                    'project_completed',
                    'project_cancelled'
                )
                AND ${dateRange('changed_at', periodEndExclusive)}
        `, periodValues),
        db.query(`
            SELECT COUNT(*) AS count
            FROM status_history
            WHERE record_type = 'project'
                AND ${dateRange('changed_at', periodEndExclusive)}
        `, periodValues)
    ]).then(([
        [updatedProjectRows],
        [statusChangeRows]
    ]) => ({
        security_projects_updated: updatedProjectRows[0].count,
        status_changes: statusChangeRows[0].count
    }));
};

const fetchRecentDashboardActivity = () => Promise.all([
    db.query(`
        SELECT
            audit_log_id AS event_id,
            record_type,
            record_id,
            action,
            changed_at,
            user_id,
            change_details
        FROM audit_log
        ORDER BY changed_at DESC, audit_log_id DESC
        LIMIT 20
    `),
    db.query(`
        SELECT
            status_history_id AS event_id,
            record_type,
            record_id,
            previous_status,
            new_status,
            changed_at,
            user_id,
            reason
        FROM status_history
        ORDER BY changed_at DESC, status_history_id DESC
        LIMIT 20
    `)
]).then(([
    [recentActions],
    [recentStatusChanges]
]) => ({
    recent_actions: recentActions,
    recent_status_changes: recentStatusChanges
}));

module.exports = {
    fetchVulnerabilitySummaryData,
    fetchVendorRiskReportData,
    fetchProjectStatusData,
    fetchSecurityActivityData,
    fetchThreatIntelligenceData,
    fetchThreatArticleTrends,
    fetchProjectActivityData,
    fetchRecentDashboardActivity
};
