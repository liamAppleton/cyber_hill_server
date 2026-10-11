
const auditLogData = [
    {
        record_type: 'vendor',
        record_id: 1,
        action: 'record_created',
        changed_at: '2026-08-01 09:15:00',
        user_id: 1,
        change_details: 'Created vendor record for Microsoft.'
    },
    {
        record_type: 'vendor',
        record_id: 2,
        action: 'record_updated',
        changed_at: '2026-08-05 11:30:00',
        user_id: 1,
        change_details: 'Updated supplier security review information.'
    },
    {
        record_type: 'vendor_risk',
        record_id: 1,
        action: 'record_created',
        changed_at: '2026-09-15 10:00:00',
        user_id: 1,
        change_details: 'Created risk relating to insufficient privileged access controls.'
    },
    {
        record_type: 'vendor_risk',
        record_id: 1,
        action: 'status_changed',
        changed_at: '2026-09-20 11:00:00',
        user_id: 1,
        change_details: 'Status changed from open to in_progress. Supplier evidence requested.'
    },
    {
        record_type: 'vendor_risk',
        record_id: 5,
        action: 'risk_accepted',
        changed_at: '2026-09-01 13:00:00',
        user_id: 1,
        change_details: 'Risk accepted temporarily pending further review of DNS account protections.'
    },
    {
        record_type: 'vendor_risk',
        record_id: 6,
        action: 'risk_resolved',
        changed_at: '2026-08-15 11:00:00',
        user_id: 1,
        change_details: 'Risk marked as resolved after remediation evidence was reviewed.'
    },
    {
        record_type: 'project',
        record_id: 1,
        action: 'record_created',
        changed_at: '2026-08-01 09:00:00',
        user_id: 1,
        change_details: 'Created project: Vulnerability Management Improvements.'
    },
    {
        record_type: 'project',
        record_id: 5,
        action: 'status_changed',
        changed_at: '2026-09-15 14:00:00',
        user_id: 1,
        change_details: 'Project placed on hold pending review of dependencies.'
    },
    {
        record_type: 'project',
        record_id: 6,
        action: 'project_completed',
        changed_at: '2026-07-28 15:30:00',
        user_id: 1,
        change_details: 'Threat Intelligence Workflow completed following validation.'
    },
    {
        record_type: 'project',
        record_id: 8,
        action: 'project_cancelled',
        changed_at: '2026-06-30 16:00:00',
        user_id: 1,
        change_details: 'Project cancelled following reassessment of requirements and priorities.'
    }
];

module.exports = auditLogData;
