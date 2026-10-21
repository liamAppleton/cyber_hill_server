const assert = require('node:assert/strict');
const { test } = require('node:test');
const { generateReportPdf } = require('./report-document-service');

test('generates a readable PDF containing report metadata, metrics and limitations', () => {
    return generateReportPdf({
        metadata: {
            report_type: 'vulnerability_summary',
            period_start: '2026-09-01',
            period_end: '2026-09-30',
            reporting_mode: 'current_state_and_period_activity',
            generated_at: '2026-10-01T09:00:00.000Z'
        },
        summary: 'Vulnerability summary',
        metrics: {
            total_open: 3,
            severity_breakdown: {
                critical: 1,
                high: 2
            }
        },
        narrative: 'Prioritise high-severity issues.',
        limitations: ['Due dates are not stored.']
    }).then((pdf) => {
        assert.ok(Buffer.isBuffer(pdf));
        assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
        assert.ok(pdf.length > 500);
        assert.equal(
            (pdf.toString('latin1').match(/\/Type \/Page\b/g) || []).length,
            1
        );
    });
});

test('supports reports that flow across multiple pages', () => {
    const metrics = Object.fromEntries(
        Array.from({ length: 36 }, (_, index) => [`control_metric_${index + 1}`, index + 1])
    );

    return generateReportPdf({
        metadata: {
            report_type: 'security_activity',
            period_start: '2026-09-01',
            period_end: '2026-09-30',
            reporting_mode: 'period_activity',
            generated_at: '2026-10-01T09:00:00.000Z'
        },
        summary: 'Security activity management report.',
        metrics,
        narrative: 'Review key activity and follow up on outstanding actions.',
        limitations: []
    }).then((pdf) => {
        const pageCount = (pdf.toString('latin1').match(/\/Type \/Page\b/g) || []).length;
        assert.ok(pageCount > 1);
    });
});

test('renders metrics grouped from all report types', () => {
    const metrics = {
        vulnerability_summary: {
            total_open: 4,
            severity_breakdown: { critical: 1, high: 2, medium: 1, low: 0 },
            identified_during_period: 5,
            remediated_during_period: 2
        },
        vendor_risk: {
            total_vendors: 8,
            open_risks: 3,
            risk_level_breakdown: { critical: 0, high: 1, medium: 2, low: 0 },
            risks_created_during_period: 2,
            risks_closed_during_period: 1
        },
        project_status: {
            total_projects: 6,
            status_breakdown: { not_started: 1, in_progress: 3, on_hold: 1, completed: 1, cancelled: 0 }
        },
        security_activity: {
            security_projects_updated: 2,
            audit_events: 12,
            status_changes: 4
        },
        threat_intelligence: {
            articles_collected_during_period: 7,
            relevant_articles: 4
        }
    };

    return generateReportPdf({
        metadata: {
            report_type: 'management_summary',
            period_start: '2026-09-01',
            period_end: '2026-09-30',
            reporting_mode: 'combined_current_state_and_period_activity',
            generated_at: '2026-10-01T09:00:00.000Z'
        },
        summary: 'Consolidated management overview.',
        metrics,
        details: {
            vulnerability_summary: {
                heading: 'Priority open vulnerabilities',
                intro: 'Immediate review recommended.',
                items: [{
                    title: 'Critical API exposure',
                    subtitle: 'Critical / Open',
                    description: 'An externally reachable service requires immediate patching.',
                    metadata: { cve: 'CVE-2026-0001' }
                }]
            },
            vendor_risk: {
                heading: 'Priority supplier risks',
                intro: 'High-impact supplier risks.',
                items: [{
                    title: 'Supplier access control gap',
                    subtitle: 'Example Supplier / High / Open',
                    description: 'Administrative access evidence is outstanding.'
                }]
            },
            project_status: {
                heading: 'Active project portfolio',
                intro: 'Current delivery work.',
                items: Array.from({ length: 15 }, (_, index) => ({
                    title: `Identity hardening project ${index + 1}`,
                    subtitle: 'In Progress / Target 2026-12-01',
                    description: 'Improve authentication and access controls. '.repeat(4),
                    metadata: {
                        project_id: index + 1,
                        start_date: '2026-09-01',
                        target_date: '2026-12-01'
                    }
                }))
            },
            security_activity: {
                heading: 'Recorded activity',
                intro: 'Recent audited activity.',
                items: [{
                    title: 'Status Changed — Project #2',
                    subtitle: 'Status change / 2026-09-20',
                    description: 'Project moved into delivery.'
                }]
            },
            threat_intelligence: {
                heading: 'Priority threat intelligence',
                intro: 'High-impact recent articles.',
                items: [{
                    title: 'Ransomware targeting unpatched systems',
                    subtitle: 'High / Tracking / Example Research',
                    description: 'Review patch coverage and backup readiness.'
                }]
            }
        },
        section_narratives: {
            vulnerability_summary: 'Prioritise critical and high-severity remediation.',
            vendor_risk: 'Follow up on outstanding supplier evidence.',
            project_status: 'Review milestones for active projects.',
            security_activity: 'Review recent recorded operational changes.',
            threat_intelligence: 'Prioritise intelligence relevant to exposure.'
        },
        narrative: 'Review the combined security posture.',
        limitations: ['Some events are not recorded consistently.']
    }).then((pdf) => {
        assert.ok(Buffer.isBuffer(pdf));
        assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
        const pageCount = (pdf.toString('latin1').match(/\/Type \/Page\b/g) || []).length;
        assert.ok(pageCount > 6);
    });
});

test('rejects missing report data', () => {
    return assert.rejects(
        generateReportPdf(null),
        /valid report data object is required/
    );
});
