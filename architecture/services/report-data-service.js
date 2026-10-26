const reportDataModels = require('../models/reportData.models');

const badRequestError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const formatLabel = (value) => String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

const truncateDescription = (value, maxLength = 480) => {
    if (typeof value !== 'string' || value.length <= maxLength) {
        return value || '';
    }

    return `${value.slice(0, maxLength - 1).trimEnd()}…`;
};

const buildReportMetadata = (reportType, periodStart, periodEnd, reportingMode) => ({
    report_type: reportType,
    period_start: periodStart,
    period_end: periodEnd,
    reporting_mode: reportingMode,
    generated_at: new Date().toISOString()
});

const buildRecordDetail = (title, subtitle, description, metadata = {}) => ({
    title,
    subtitle,
    description: truncateDescription(description),
    metadata
});

const buildVulnerabilityReport = (data, metadata) => {
    const severityBreakdown = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
    };

    data.open_vulnerabilities.forEach(({ severity }) => {
        const normalizedSeverity = typeof severity === 'string'
            ? severity.toLowerCase()
            : '';

        if (Object.prototype.hasOwnProperty.call(severityBreakdown, normalizedSeverity)) {
            severityBreakdown[normalizedSeverity] += 1;
        }
    });

    return {
        metadata,
        summary: 'Vulnerability identification and remediation summary for the reporting period.',
        metrics: {
            total_open: data.open_vulnerabilities.length,
            severity_breakdown: severityBreakdown,
            identified_during_period: data.identified_during_period,
            remediated_during_period: data.remediated_during_period
        },
        narrative: 'Prioritise remediation of critical and high-severity findings.',
        details: {
            heading: 'Priority open vulnerabilities',
            intro: data.priority_vulnerabilities.length
                ? `Showing up to ${data.priority_vulnerabilities.length} open critical or high-severity vulnerabilities for immediate review.`
                : 'No open critical or high-severity vulnerabilities were found.',
            empty_message: 'No priority vulnerabilities to list.',
            items: data.priority_vulnerabilities.map((vulnerability) => (
                buildRecordDetail(
                    vulnerability.title,
                    [
                        vulnerability.severity,
                        vulnerability.cve,
                        vulnerability.status
                    ].filter(Boolean).join('  /  '),
                    vulnerability.description,
                    {
                        affected_assets: (vulnerability.assets || []).join(', ') || 'None recorded',
                        date_discovered: vulnerability.date_discovered
                    }
                )
            ))
        },
        limitations: [
            'Overdue vulnerabilities cannot be calculated because the vulnerability schema has no due-date field.',
            'Remediation counts use resolved_at and recorded status_history entries; current status-update handlers do not consistently populate either source.'
        ]
    };
};

const buildVendorRiskReport = (data, metadata) => {
    const riskLevelBreakdown = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
    };

    data.open_risks.forEach(({ risk_level }) => {
        if (Object.prototype.hasOwnProperty.call(riskLevelBreakdown, risk_level)) {
            riskLevelBreakdown[risk_level] += 1;
        }
    });

    return {
        metadata,
        summary: 'Supplier security risk summary for the reporting period.',
        metrics: {
            total_vendors: data.total_vendors,
            open_risks: data.open_risks.length,
            risk_level_breakdown: riskLevelBreakdown,
            risks_created_during_period: data.risks_created_during_period,
            risks_closed_during_period: data.risks_closed_during_period
        },
        narrative: 'Follow up on outstanding supplier assurance evidence.',
        details: {
            heading: 'Priority supplier risks',
            intro: data.priority_risks.length
                ? `Showing up to ${data.priority_risks.length} open critical or high-level supplier risks.`
                : 'No open critical or high-level supplier risks were found.',
            empty_message: 'No priority supplier risks to list.',
            items: data.priority_risks.map((risk) => (
                buildRecordDetail(
                    risk.vendor_name || 'Unknown vendor',
                    [risk.title, formatLabel(risk.risk_level), formatLabel(risk.status)]
                        .filter(Boolean)
                        .join('  /  '),
                    risk.description,
                    { date_identified: risk.date_identified }
                )
            ))
        },
        limitations: [
            'Vendors reviewed during the period cannot be calculated because reviews are not recorded at the vendor level.',
            'Risk closure counts use resolved_at and recorded status_history entries; current risk status updates do not consistently populate either source.'
        ]
    };
};

const buildProjectReport = (projects, metadata) => {
    const statusBreakdown = {
        not_started: 0,
        in_progress: 0,
        on_hold: 0,
        completed: 0,
        cancelled: 0
    };

    projects.forEach(({ status }) => {
        if (Object.prototype.hasOwnProperty.call(statusBreakdown, status)) {
            statusBreakdown[status] += 1;
        }
    });

    return {
        metadata,
        summary: 'Current cybersecurity project status.',
        metrics: {
            total_projects: projects.length,
            status_breakdown: statusBreakdown
        },
        narrative: 'Review milestones and progress across the full project portfolio.',
        details: {
            heading: 'Full project portfolio',
            intro: 'Complete recorded details for every project, including active, completed, and cancelled projects.',
            empty_message: 'There are no projects.',
            items: projects.map((project) => ({
                title: project.title,
                subtitle: formatLabel(project.status),
                description: project.description || 'No description recorded.',
                metadata: {
                    project_id: project.project_id,
                    start_date: project.start_date || 'Not recorded',
                    target_date: project.target_date || 'Not recorded',
                    completed_at: project.completed_at || 'Not recorded',
                    created_at: project.created_at || 'Not recorded',
                    updated_at: project.updated_at || 'Not recorded'
                }
            }))
        },
        limitations: []
    };
};

const buildSecurityActivityReport = (data, metadata) => ({
    metadata,
    summary: 'Summary of recorded security management activity during the reporting period.',
    metrics: {
        security_projects_updated: data.security_projects_updated,
        audit_events: data.audit_events,
        status_changes: data.status_changes
    },
    narrative: 'Review outstanding actions and document key security improvements.',
    details: {
        heading: 'Recorded activity',
        intro: 'Recent audit actions and status changes recorded during the reporting period.',
        empty_message: 'No recent audit actions or status changes were recorded in this period.',
        items: [
            ...data.recent_audit_events.map((event) => (
                buildRecordDetail(
                    `${formatLabel(event.action)} — ${formatLabel(event.record_type)} #${event.record_id}`,
                    `Audit event  /  ${event.changed_at}`,
                    event.change_details
                )
            )),
            ...data.recent_status_changes.map((change) => (
                buildRecordDetail(
                    `${formatLabel(change.record_type)} #${change.record_id}: ${change.previous_status || 'Initial'} → ${change.new_status}`,
                    `Status change  /  ${change.changed_at}`,
                    change.reason
                )
            ))
        ].sort((left, right) => (
            new Date(right.subtitle.split('  /  ').at(-1)) -
            new Date(left.subtitle.split('  /  ').at(-1))
        )).slice(0, 8)
    },
    limitations: [
        'Vulnerability reviews and supplier reviews cannot be counted because the audit records do not identify those review events as structured actions.',
        'Project update counts include distinct projects with audit-log activity, not unaudited updates.',
        'Activity metrics count only rows currently recorded in audit_log and status_history; update handlers do not consistently write those records.'
    ]
});

const buildThreatIntelligenceReport = (data, metadata) => ({
    metadata,
    summary: 'Threat intelligence collection and relevance summary for the reporting period.',
    metrics: {
        articles_collected_during_period: data.articles_collected_during_period,
        relevant_articles: data.relevant_articles
    },
    narrative: 'Prioritise intelligence relevant to the organisation technology and threat exposure.',
    details: {
        heading: 'Priority threat intelligence',
        intro: data.priority_articles.length
            ? `Recent high-impact articles collected during the reporting period, ordered by severity and threat score.`
            : 'No new or tracking threat articles were collected during the reporting period.',
        empty_message: 'No priority threat articles to list.',
        items: data.priority_articles.map((article) => (
            buildRecordDetail(
                article.title,
                [
                    formatLabel(article.severity),
                    formatLabel(article.status),
                    article.source,
                    `Score ${article.threat_score}`
                ].filter(Boolean).join('  /  '),
                article.description,
                { date_ingested: article.date_ingested }
            )
        ))
    },
    limitations: [
        'Priority counts cannot be calculated because the article schema has severity and threat score but no priority field.',
        'Threat categories cannot be calculated because the article schema has no category field.'
    ]
});

const reportBuilders = {
    vulnerability_summary: {
        reportingMode: 'current_state_and_period_activity',
        fetchData: (...args) => reportDataModels.fetchVulnerabilitySummaryData(...args),
        build: buildVulnerabilityReport
    },
    vendor_risk: {
        reportingMode: 'current_state_and_period_activity',
        fetchData: (...args) => reportDataModels.fetchVendorRiskReportData(...args),
        build: buildVendorRiskReport
    },
    project_status: {
        reportingMode: 'current_state',
        fetchData: (...args) => reportDataModels.fetchProjectStatusData(...args),
        build: buildProjectReport
    },
    security_activity: {
        reportingMode: 'period_activity',
        fetchData: (...args) => reportDataModels.fetchSecurityActivityData(...args),
        build: buildSecurityActivityReport
    },
    threat_intelligence: {
        reportingMode: 'period_activity_and_current_state',
        fetchData: (...args) => reportDataModels.fetchThreatIntelligenceData(...args),
        build: buildThreatIntelligenceReport
    }
};

const parseISODate = (value, fieldName) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw badRequestError(`${fieldName} must be a valid ISO date in YYYY-MM-DD format.`);
    }

    const [year, month, day] = value.split('-').map(Number);
    if (year < 1000 || year > 9999) {
        throw badRequestError(`${fieldName} must be within the database-supported date range.`);
    }

    const date = new Date(0);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCFullYear(year, month - 1, day);

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        throw badRequestError(`${fieldName} must be a valid ISO date in YYYY-MM-DD format.`);
    }

    return date;
};

const validatePeriod = (periodStart, periodEnd) => {
    const startDate = parseISODate(periodStart, 'period_start');
    const endDate = parseISODate(periodEnd, 'period_end');

    if (startDate > endDate) {
        throw badRequestError('The reporting period start must not be after its end.');
    }

    endDate.setUTCDate(endDate.getUTCDate() + 1);
    const endYear = endDate.getUTCFullYear();
    const periodEndExclusive = endYear > 9999
        ? null
        : [
            String(endYear).padStart(4, '0'),
            String(endDate.getUTCMonth() + 1).padStart(2, '0'),
            String(endDate.getUTCDate()).padStart(2, '0')
        ].join('-');

    return {
        periodStart,
        periodEnd,
        periodEndExclusive
    };
};

const generateReportData = (reportType, periodStart, periodEnd) => {
    if (!Object.prototype.hasOwnProperty.call(reportBuilders, reportType)) {
        return Promise.reject(badRequestError(`Unsupported report type: ${reportType}`));
    }

    const reportBuilder = reportBuilders[reportType];

    let period;

    try {
        period = validatePeriod(periodStart, periodEnd);
    } catch (error) {
        return Promise.reject(error);
    }

    const metadata = buildReportMetadata(
        reportType,
        period.periodStart,
        period.periodEnd,
        reportBuilder.reportingMode
    );

    const fetchArguments = reportType === 'project_status'
        ? []
        : [period.periodStart, period.periodEndExclusive];

    return reportBuilder.fetchData(...fetchArguments)
        .then((data) => reportBuilder.build(data, metadata));
};

const generateManagementReportData = (periodStart, periodEnd) => {
    const reportTypes = Object.keys(reportBuilders);

    return Promise.all(
        reportTypes.map((reportType) => (
            generateReportData(reportType, periodStart, periodEnd)
        ))
    ).then((reports) => {
        const reportsByType = Object.fromEntries(
            reports.map((report) => [report.metadata.report_type, report])
        );

        return {
            metadata: buildReportMetadata(
                'management_summary',
                periodStart,
                periodEnd,
                'combined_current_state_and_period_activity'
            ),
            summary: 'Executive overview of vulnerability exposure, supplier risk, project delivery, security activity and threat intelligence.',
            metrics: Object.fromEntries(
                reportTypes.map((reportType) => [
                    reportType,
                    reportsByType[reportType].metrics
                ])
            ),
            details: Object.fromEntries(
                reportTypes.map((reportType) => [
                    reportType,
                    reportsByType[reportType].details
                ])
            ),
            section_narratives: Object.fromEntries(
                reportTypes.map((reportType) => [
                    reportType,
                    reportsByType[reportType].narrative
                ])
            ),
            narrative: reports
                .map((report) => `${report.metadata.report_type}: ${report.narrative}`)
                .join('\n'),
            limitations: reports.flatMap((report) => (
                report.limitations.map((limitation) => (
                    `${report.metadata.report_type}: ${limitation}`
                ))
            ))
        };
    });
};

module.exports = {
    generateReportData,
    generateManagementReportData,
    validatePeriod
};
