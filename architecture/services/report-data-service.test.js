const assert = require('node:assert/strict');
const { test } = require('node:test');
const reportDataModels = require('../models/reportData.models');

let vulnerabilityData;
let vendorRiskData;
let projectData;
let securityActivityData;
let threatIntelligenceData;
let receivedPeriod;

reportDataModels.fetchVulnerabilitySummaryData = (start, endExclusive) => {
    receivedPeriod = [start, endExclusive];
    return vulnerabilityData instanceof Error
        ? Promise.reject(vulnerabilityData)
        : Promise.resolve(vulnerabilityData);
};
reportDataModels.fetchVendorRiskReportData = () => Promise.resolve(vendorRiskData);
reportDataModels.fetchProjectStatusData = () => Promise.resolve(projectData);
reportDataModels.fetchSecurityActivityData = () => Promise.resolve(securityActivityData);
reportDataModels.fetchThreatIntelligenceData = () => Promise.resolve(threatIntelligenceData);

const {
    generateReportData,
    generateManagementReportData,
    validatePeriod
} = require('./report-data-service');

test('validates calendar dates and constructs an inclusive end-date interval', () => {
    assert.deepEqual(validatePeriod('2024-02-29', '2024-03-01'), {
        periodStart: '2024-02-29',
        periodEnd: '2024-03-01',
        periodEndExclusive: '2024-03-02'
    });
    assert.equal(
        validatePeriod('9999-12-31', '9999-12-31').periodEndExclusive,
        null
    );
    assert.throws(() => validatePeriod('2026-02-29', '2026-03-01'), /valid ISO date/);
    assert.throws(() => validatePeriod('2026-10-02', '2026-10-01'), /must not be after/);
});

test('builds vulnerability metrics from fetched records and uses an exclusive end boundary', () => {
    vulnerabilityData = {
        open_vulnerabilities: [
            { severity: 'Critical' },
            { severity: 'High' },
            { severity: 'Unknown' }
        ],
        priority_vulnerabilities: [{
            title: 'Critical remote access issue',
            severity: 'Critical',
            status: 'Open',
            cve: 'CVE-2026-0001',
            description: 'A critical issue requires patching.'
        }],
        identified_during_period: 4,
        remediated_during_period: 2
    };

    return generateReportData(
        'vulnerability_summary',
        '2026-09-01',
        '2026-09-30'
    ).then((report) => {
        assert.deepEqual(receivedPeriod, ['2026-09-01', '2026-10-01']);
        assert.equal(report.metadata.reporting_mode, 'current_state_and_period_activity');
        assert.equal(report.metrics.total_open, 3);
        assert.deepEqual(report.metrics.severity_breakdown, {
            critical: 1,
            high: 1,
            medium: 0,
            low: 0
        });
        assert.equal(report.metrics.identified_during_period, 4);
        assert.equal(report.metrics.remediated_during_period, 2);
        assert.equal(report.details.items[0].title, 'Critical remote access issue');
        assert.equal(Object.hasOwn(report.metrics, 'overdue'), false);
        assert.equal(report.limitations.length, 2);
    });
});

test('builds project status counts from the supported status values', () => {
    const fullDescription = 'A'.repeat(600);
    projectData = [
        {
            project_id: 1,
            title: 'Project Alpha',
            description: fullDescription,
            status: 'not_started',
            start_date: '2026-01-01',
            target_date: '2026-06-01',
            completed_at: null,
            created_at: '2025-12-01 09:00:00',
            updated_at: '2026-01-02 09:00:00'
        },
        { project_id: 2, title: 'Project Beta', status: 'in_progress' },
        { project_id: 3, title: 'Project Gamma', status: 'in_progress' },
        { project_id: 4, title: 'Project Delta', status: 'completed' },
        { project_id: 5, title: 'Project Epsilon', status: 'cancelled' },
        { project_id: 6, title: 'Project Zeta', status: 'unexpected' }
    ];

    return generateReportData(
        'project_status',
        '2026-09-01',
        '2026-09-30'
    ).then((report) => {
        assert.equal(report.metrics.total_projects, 6);
        assert.deepEqual(report.metrics.status_breakdown, {
            not_started: 1,
            in_progress: 2,
            on_hold: 0,
            completed: 1,
            cancelled: 1
        });
        assert.equal(report.details.items.length, projectData.length);
        assert.equal(report.details.items[0].description, fullDescription);
        assert.deepEqual(report.details.items[0].metadata, {
            project_id: 1,
            start_date: '2026-01-01',
            target_date: '2026-06-01',
            completed_at: 'Not recorded',
            created_at: '2025-12-01 09:00:00',
            updated_at: '2026-01-02 09:00:00'
        });
        assert.equal(report.details.items[3].title, 'Project Delta');
        assert.equal(report.details.items[4].title, 'Project Epsilon');
    });
});

test('omits unavailable vendor and security-review metrics with explanations', () => {
    vendorRiskData = {
        total_vendors: 3,
        open_risks: [
            { risk_level: 'critical' },
            { risk_level: 'high' },
            { risk_level: 'high' }
        ],
        priority_risks: [{
            title: 'Privileged access review outstanding',
            vendor_name: 'Example Supplier',
            risk_level: 'critical',
            status: 'open',
            description: 'Supplier evidence is still required.'
        }],
        risks_created_during_period: 2,
        risks_closed_during_period: 1
    };
    securityActivityData = {
        security_projects_updated: 2,
        audit_events: 5,
        status_changes: 3,
        recent_audit_events: [{
            record_type: 'vendor_risk',
            record_id: 2,
            action: 'record_updated',
            changed_at: '2026-09-20T10:00:00Z',
            change_details: 'Supplier submitted updated assurance evidence.'
        }],
        recent_status_changes: [{
            record_type: 'project',
            record_id: 1,
            previous_status: 'not_started',
            new_status: 'in_progress',
            changed_at: '2026-09-19T10:00:00Z',
            reason: 'Work began.'
        }]
    };

    return generateReportData(
        'vendor_risk',
        '2026-09-01',
        '2026-09-30'
    ).then((vendorReport) => generateReportData(
        'security_activity',
        '2026-09-01',
        '2026-09-30'
    ).then((activityReport) => {
        assert.equal(vendorReport.metrics.total_vendors, 3);
        assert.equal(vendorReport.metrics.open_risks, 3);
        assert.deepEqual(vendorReport.metrics.risk_level_breakdown, {
            critical: 1,
            high: 2,
            medium: 0,
            low: 0
        });
        assert.equal(Object.hasOwn(vendorReport.metrics, 'vendors_reviewed_during_period'), false);
        assert.equal(Object.hasOwn(activityReport.metrics, 'vulnerability_reviews'), false);
        assert.equal(Object.hasOwn(activityReport.metrics, 'supplier_reviews'), false);
        assert.equal(activityReport.metrics.audit_events, 5);
        assert.ok(activityReport.limitations.length > 0);
    }));
});

test('omits unsupported threat priority and category metrics', () => {
    threatIntelligenceData = {
        articles_collected_during_period: 2,
        relevant_articles: 1,
        priority_articles: [{
            title: 'Active exploitation of edge devices',
            description: 'Review exposed infrastructure and patch levels.',
            source: 'Example Threat Research',
            severity: 'critical',
            status: 'tracking',
            threat_score: 90
        }]
    };

    return generateReportData(
        'threat_intelligence',
        '2026-09-01',
        '2026-09-30'
    ).then((report) => {
        assert.equal(report.metrics.articles_collected_during_period, 2);
        assert.equal(report.metrics.relevant_articles, 1);
        assert.equal(Object.hasOwn(report.metrics, 'high_priority_articles'), false);
        assert.equal(Object.hasOwn(report.metrics, 'critical_priority_articles'), false);
        assert.equal(Object.hasOwn(report.metrics, 'threat_categories'), false);
        assert.equal(report.limitations.length, 2);
    });
});

test('combines metrics from all five report types for a management report', () => {
    vulnerabilityData = {
        open_vulnerabilities: [{ severity: 'Critical' }],
        priority_vulnerabilities: [{
            title: 'Critical API exposure',
            severity: 'Critical',
            status: 'Open',
            description: 'Publicly reachable service is affected.'
        }],
        identified_during_period: 3,
        remediated_during_period: 1
    };
    vendorRiskData = {
        total_vendors: 5,
        open_risks: [{ risk_level: 'high' }],
        priority_risks: [{
            title: 'Supplier access control gap',
            vendor_name: 'Example Supplier',
            risk_level: 'high',
            status: 'open',
            description: 'Administrative controls need evidence.'
        }],
        risks_created_during_period: 2,
        risks_closed_during_period: 1
    };
    projectData = [{ status: 'in_progress' }];
    securityActivityData = {
        security_projects_updated: 1,
        audit_events: 4,
        status_changes: 2,
        recent_audit_events: [],
        recent_status_changes: []
    };
    threatIntelligenceData = {
        articles_collected_during_period: 6,
        relevant_articles: 3,
        priority_articles: [{
            title: 'Ransomware activity against unpatched servers',
            description: 'Review patch coverage and backup readiness.',
            source: 'Example Threat Intelligence',
            severity: 'high',
            status: 'new',
            threat_score: 84
        }]
    };

    return generateManagementReportData('2026-09-01', '2026-09-30')
        .then((report) => {
            assert.equal(report.metadata.report_type, 'management_summary');
            assert.equal(report.metadata.period_start, '2026-09-01');
            assert.deepEqual(Object.keys(report.metrics), [
                'vulnerability_summary',
                'vendor_risk',
                'project_status',
                'security_activity',
                'threat_intelligence'
            ]);
            assert.equal(report.metrics.vulnerability_summary.total_open, 1);
            assert.equal(report.metrics.vendor_risk.total_vendors, 5);
            assert.equal(report.metrics.project_status.total_projects, 1);
            assert.equal(report.metrics.security_activity.audit_events, 4);
            assert.equal(report.metrics.threat_intelligence.relevant_articles, 3);
            assert.ok(report.limitations.length > 0);
            assert.equal(
                report.details.threat_intelligence.items[0].title,
                'Ransomware activity against unpatched servers'
            );
        });
});

test('rejects invalid inputs and propagates source query failures', () => {
    return Promise.all([
        assert.rejects(
            generateReportData('unsupported', '2026-09-01', '2026-09-30'),
            /Unsupported report type/
        ),
        assert.rejects(
            generateReportData('project_status', '2026-09-31', '2026-10-01'),
            /valid ISO date/
        )
    ]).then(() => {
        const databaseError = new Error('database unavailable');
        vulnerabilityData = databaseError;
        return assert.rejects(
            generateReportData('vulnerability_summary', '2026-09-01', '2026-09-30'),
            (error) => error === databaseError
        );
    });
});
