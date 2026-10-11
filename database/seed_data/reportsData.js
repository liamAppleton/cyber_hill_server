
const reportsData = [
    {
        title: 'Monthly Vulnerability Management Report',
        report_type: 'vulnerability_summary',
        period_start: '2026-09-01',
        period_end: '2026-09-30',
        generated_at: '2026-10-01 09:00:00',
        created_by: 1,
        report_status: 'completed',
        report_content: JSON.stringify({
            summary: 'Monthly overview of vulnerability identification and remediation.',
            total_vulnerabilities: 42,
            critical: 3,
            high: 9,
            medium: 18,
            low: 12,
            notes: 'Prioritise remediation of critical and high-severity findings.'
        }),
        file_location: '/reports/vulnerability-management-2026-09.pdf'
    },
    {
        title: 'Supplier Security Risk Review',
        report_type: 'vendor_risk',
        period_start: '2026-09-01',
        period_end: '2026-09-30',
        generated_at: '2026-10-02 10:30:00',
        created_by: 1,
        report_status: 'completed',
        report_content: JSON.stringify({
            summary: 'Review of supplier security risks and outstanding actions.',
            suppliers_reviewed: 8,
            open_risks: 6,
            critical_risks: 1,
            high_risks: 3,
            notes: 'Follow up on outstanding supplier assurance evidence.'
        }),
        file_location: '/reports/supplier-risk-review-2026-09.pdf'
    },
    {
        title: 'Cybersecurity Project Progress',
        report_type: 'project_status',
        period_start: '2026-10-01',
        period_end: '2026-10-31',
        generated_at: '2026-10-05 14:00:00',
        created_by: 1,
        report_status: 'draft',
        report_content: JSON.stringify({
            summary: 'Progress update for active cybersecurity projects.',
            active_projects: 4,
            on_hold_projects: 1,
            completed_projects: 2,
            notes: 'Update project milestones before finalising the report.'
        }),
        file_location: null
    },
    {
        title: 'Quarterly Security Activity Report',
        report_type: 'security_activity',
        period_start: '2026-07-01',
        period_end: '2026-09-30',
        generated_at: '2026-10-03 11:15:00',
        created_by: 1,
        report_status: 'completed',
        report_content: JSON.stringify({
            summary: 'Quarterly summary of security management activity.',
            vulnerability_reviews: 12,
            supplier_reviews: 8,
            security_projects: 5,
            notes: 'Figures are illustrative dummy data for development.'
        }),
        file_location: '/reports/security-activity-q3-2026.pdf'
    },
    {
        title: 'Threat Intelligence Summary',
        report_type: 'threat_intelligence',
        period_start: '2026-09-01',
        period_end: '2026-09-30',
        generated_at: '2026-10-04 09:45:00',
        created_by: 1,
        report_status: 'generating',
        report_content: null,
        file_location: null
    },
    {
        title: 'Failed Report Generation Test',
        report_type: 'security_activity',
        period_start: '2026-08-01',
        period_end: '2026-08-31',
        generated_at: '2026-09-01 08:30:00',
        created_by: 1,
        report_status: 'failed',
        report_content: null,
        file_location: null
    },
    {
        title: 'Annual Vulnerability Overview',
        report_type: 'vulnerability_summary',
        period_start: '2026-01-01',
        period_end: '2026-12-31',
        generated_at: '2026-10-06 15:00:00',
        created_by: 1,
        report_status: 'draft',
        report_content: JSON.stringify({
            summary: 'Draft annual overview of vulnerability management performance.',
            notes: 'Complete the reporting period before publishing this report.'
        }),
        file_location: null
    }
];

module.exports = reportsData;
