
const statusHistoryData = [
    {
        record_type: 'project',
        record_id: 1,
        previous_status: 'not_started',
        new_status: 'in_progress',
        changed_at: '2026-08-01 09:00:00',
        user_id: 1,
        reason: 'Project work commenced.'
    },
    {
        record_type: 'project',
        record_id: 2,
        previous_status: 'not_started',
        new_status: 'in_progress',
        changed_at: '2026-09-01 10:00:00',
        user_id: 1,
        reason: 'Initial security policy review started.'
    },
    {
        record_type: 'project',
        record_id: 5,
        previous_status: 'in_progress',
        new_status: 'on_hold',
        changed_at: '2026-09-15 14:00:00',
        user_id: 1,
        reason: 'Implementation paused pending review of dependencies.'
    },
    {
        record_type: 'project',
        record_id: 6,
        previous_status: 'in_progress',
        new_status: 'completed',
        changed_at: '2026-07-28 15:30:00',
        user_id: 1,
        reason: 'Threat intelligence workflow implemented and validated.'
    },
    {
        record_type: 'project',
        record_id: 8,
        previous_status: 'in_progress',
        new_status: 'cancelled',
        changed_at: '2026-06-30 16:00:00',
        user_id: 1,
        reason: 'Project cancelled following reassessment of requirements.'
    },
    {
        record_type: 'vendor_risk',
        record_id: 1,
        previous_status: 'open',
        new_status: 'in_progress',
        changed_at: '2026-09-20 11:00:00',
        user_id: 1,
        reason: 'Supplier evidence requested to support remediation.'
    },
    {
        record_type: 'vendor_risk',
        record_id: 3,
        previous_status: 'open',
        new_status: 'in_progress',
        changed_at: '2026-09-12 09:30:00',
        user_id: 1,
        reason: 'Incident escalation concerns raised with the supplier.'
    },
    {
        record_type: 'vendor_risk',
        record_id: 5,
        previous_status: 'open',
        new_status: 'accepted',
        changed_at: '2026-09-01 13:00:00',
        user_id: 1,
        reason: 'Risk temporarily accepted pending further review.'
    },
    {
        record_type: 'vendor_risk',
        record_id: 6,
        previous_status: 'in_progress',
        new_status: 'resolved',
        changed_at: '2026-08-15 11:00:00',
        user_id: 1,
        reason: 'Remediation evidence reviewed and accepted.'
    },
    {
        record_type: 'vendor_risk',
        record_id: 9,
        previous_status: 'in_progress',
        new_status: 'resolved',
        changed_at: '2026-07-01 09:30:00',
        user_id: 1,
        reason: 'Unnecessary supplier account permissions removed.'
    }
];

module.exports = statusHistoryData;
