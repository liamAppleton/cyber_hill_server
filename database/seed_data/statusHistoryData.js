
const statusHistoryData = [
  // Projects
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
    record_id: 1,
    previous_status: 'in_progress',
    new_status: 'on_hold',
    changed_at: '2026-08-10 11:30:00',
    user_id: 1,
    reason: 'Work paused while dependencies were reviewed.'
  },
  {
    record_type: 'project',
    record_id: 1,
    previous_status: 'on_hold',
    new_status: 'in_progress',
    changed_at: '2026-08-18 09:15:00',
    user_id: 1,
    reason: 'Dependencies resolved and project work resumed.'
  },
  {
    record_type: 'project',
    record_id: 1,
    previous_status: 'in_progress',
    new_status: 'completed',
    changed_at: '2026-09-05 16:00:00',
    user_id: 1,
    reason: 'Project deliverables completed and verified.'
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
    record_id: 2,
    previous_status: 'in_progress',
    new_status: 'on_hold',
    changed_at: '2026-09-08 14:00:00',
    user_id: 1,
    reason: 'Review paused pending stakeholder feedback.'
  },
  {
    record_type: 'project',
    record_id: 2,
    previous_status: 'on_hold',
    new_status: 'in_progress',
    changed_at: '2026-09-22 09:30:00',
    user_id: 1,
    reason: 'Stakeholder feedback received and review resumed.'
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
    previous_status: 'not_started',
    new_status: 'in_progress',
    changed_at: '2026-07-10 09:00:00',
    user_id: 1,
    reason: 'Threat intelligence workflow development started.'
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

  // Vendor risks
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
    record_id: 1,
    previous_status: 'in_progress',
    new_status: 'resolved',
    changed_at: '2026-10-02 14:30:00',
    user_id: 1,
    reason: 'Supplier evidence reviewed and remediation verified.'
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
    record_id: 3,
    previous_status: 'in_progress',
    new_status: 'open',
    changed_at: '2026-09-25 13:15:00',
    user_id: 1,
    reason: 'Supplier response did not adequately address the outstanding concerns.'
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
    record_id: 5,
    previous_status: 'accepted',
    new_status: 'in_progress',
    changed_at: '2026-10-01 10:00:00',
    user_id: 1,
    reason: 'Risk review completed and mitigation work initiated.'
  },
  {
    record_type: 'vendor_risk',
    record_id: 6,
    previous_status: 'open',
    new_status: 'in_progress',
    changed_at: '2026-08-01 09:00:00',
    user_id: 1,
    reason: 'Remediation actions assigned to the supplier.'
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
    previous_status: 'open',
    new_status: 'in_progress',
    changed_at: '2026-06-15 10:00:00',
    user_id: 1,
    reason: 'Supplier access permissions reviewed.'
  },
  {
    record_type: 'vendor_risk',
    record_id: 9,
    previous_status: 'in_progress',
    new_status: 'resolved',
    changed_at: '2026-07-01 09:30:00',
    user_id: 1,
    reason: 'Unnecessary supplier account permissions removed.'
  },

  // Vulnerabilities
  {
    record_type: 'vulnerability',
    record_id: 1,
    previous_status: 'Open',
    new_status: 'In Progress',
    changed_at: '2026-09-02 09:00:00',
    user_id: 1,
    reason: 'Remediation investigation started.'
  },
  {
    record_type: 'vulnerability',
    record_id: 1,
    previous_status: 'In Progress',
    new_status: 'Resolved',
    changed_at: '2026-09-04 15:30:00',
    user_id: 1,
    reason: 'Patch applied and verification scan passed.'
  },
  {
    record_type: 'vulnerability',
    record_id: 2,
    previous_status: 'Open',
    new_status: 'In Progress',
    changed_at: '2026-09-10 10:00:00',
    user_id: 1,
    reason: 'Technical investigation and remediation planning started.'
  },
  {
    record_type: 'vulnerability',
    record_id: 2,
    previous_status: 'In Progress',
    new_status: 'Open',
    changed_at: '2026-09-12 12:00:00',
    user_id: 1,
    reason: 'Initial remediation attempt was unsuccessful.'
  },
  {
    record_type: 'vulnerability',
    record_id: 3,
    previous_status: 'Open',
    new_status: 'Accepted Risk',
    changed_at: '2026-09-18 14:00:00',
    user_id: 1,
    reason: 'Risk accepted pending the next scheduled maintenance window.'
  },
  {
    record_type: 'vulnerability',
    record_id: 4,
    previous_status: 'Open',
    new_status: 'In Progress',
    changed_at: '2026-10-01 08:30:00',
    user_id: 1,
    reason: 'Remediation assigned and work commenced.'
  },

  // Assets
  {
    record_type: 'asset',
    record_id: 1,
    previous_status: 'active',
    new_status: 'under_maintenance',
    changed_at: '2026-08-05 08:00:00',
    user_id: 1,
    reason: 'Scheduled maintenance started.'
  },
  {
    record_type: 'asset',
    record_id: 1,
    previous_status: 'under_maintenance',
    new_status: 'active',
    changed_at: '2026-08-05 12:00:00',
    user_id: 1,
    reason: 'Maintenance completed and service restored.'
  },
  {
    record_type: 'asset',
    record_id: 2,
    previous_status: 'active',
    new_status: 'decommissioned',
    changed_at: '2026-09-30 16:00:00',
    user_id: 1,
    reason: 'Asset retired after replacement.'
  },

  // Vulnerability-asset associations
  {
    record_type: 'vulnerability_asset',
    record_id: 1,
    previous_status: 'Open',
    new_status: 'In Progress',
    changed_at: '2026-09-03 09:30:00',
    user_id: 1,
    reason: 'Remediation started on the affected asset.'
  },
  {
    record_type: 'vulnerability_asset',
    record_id: 1,
    previous_status: 'In Progress',
    new_status: 'Resolved',
    changed_at: '2026-09-05 11:00:00',
    user_id: 1,
    reason: 'Vulnerability no longer detected on the asset.'
  },
  {
    record_type: 'vulnerability_asset',
    record_id: 2,
    previous_status: 'Open',
    new_status: 'In Progress',
    changed_at: '2026-09-14 13:00:00',
    user_id: 1,
    reason: 'Asset owner notified and remediation scheduled.'
  },

  // Threat articles
  {
    record_type: 'threat_article',
    record_id: 1,
    previous_status: 'new',
    new_status: 'reviewed',
    changed_at: '2026-10-03 09:00:00',
    user_id: 1,
    reason: 'Threat intelligence article reviewed.'
  },
  {
    record_type: 'threat_article',
    record_id: 1,
    previous_status: 'reviewed',
    new_status: 'actioned',
    changed_at: '2026-10-03 14:00:00',
    user_id: 1,
    reason: 'Relevant indicators and recommended actions recorded.'
  },
  {
    record_type: 'threat_article',
    record_id: 2,
    previous_status: 'new',
    new_status: 'reviewed',
    changed_at: '2026-10-05 10:30:00',
    user_id: 1,
    reason: 'Article assessed for relevance to the organisation.'
  },
  {
    record_type: 'threat_article',
    record_id: 3,
    previous_status: 'new',
    new_status: 'dismissed',
    changed_at: '2026-10-07 15:00:00',
    user_id: 1,
    reason: 'Article reviewed and determined not to be relevant.'
  }
];

module.exports = statusHistoryData;
