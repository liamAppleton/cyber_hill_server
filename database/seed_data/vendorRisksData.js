
const vendorRisksData = [
    {
        vendor_id: 1,
        title: 'Insufficient privileged access controls',
        description: 'Administrative access may not be sufficiently restricted or reviewed, increasing the risk of unauthorised access to cloud services and organisational data.',
        risk_level: 'high',
        status: 'in_progress',
        date_identified: '2026-09-15',
        last_reviewed_at: '2026-10-01 10:00:00',
        resolved_at: null
    },
    {
        vendor_id: 1,
        title: 'Third-party data processing assurance',
        description: 'Confirm that contractual data protection requirements, retention arrangements, and security assurance evidence remain appropriate.',
        risk_level: 'medium',
        status: 'open',
        date_identified: '2026-09-20',
        last_reviewed_at: null,
        resolved_at: null
    },
    {
        vendor_id: 2,
        title: 'Delayed security incident escalation',
        description: 'Failure to escalate a critical security alert within agreed timeframes could delay incident containment and increase the impact of a compromise.',
        risk_level: 'critical',
        status: 'in_progress',
        date_identified: '2026-09-10',
        last_reviewed_at: '2026-10-05 14:30:00',
        resolved_at: null
    },
    {
        vendor_id: 2,
        title: 'Outstanding penetration test findings',
        description: 'Evidence is required to confirm that high-risk findings identified during supplier penetration testing have been remediated.',
        risk_level: 'high',
        status: 'open',
        date_identified: '2026-09-25',
        last_reviewed_at: null,
        resolved_at: null
    },
    {
        vendor_id: 3,
        title: 'Unauthorised DNS configuration changes',
        description: 'Compromise of the supplier account could allow malicious DNS changes, potentially redirecting users to fraudulent services.',
        risk_level: 'high',
        status: 'accepted',
        date_identified: '2026-08-18',
        last_reviewed_at: '2026-10-02 09:00:00',
        resolved_at: null
    },
    {
        vendor_id: 4,
        title: 'Payroll data exposure',
        description: 'Inadequate access restrictions or data handling controls could expose sensitive employee payroll and personal information.',
        risk_level: 'high',
        status: 'resolved',
        date_identified: '2026-07-12',
        last_reviewed_at: '2026-08-15 11:00:00',
        resolved_at: '2026-08-15 11:00:00'
    },
    {
        vendor_id: 5,
        title: 'Excessive customer data access',
        description: 'Third-party staff may retain access to customer information beyond the minimum required for their operational responsibilities.',
        risk_level: 'medium',
        status: 'open',
        date_identified: '2026-09-28',
        last_reviewed_at: null,
        resolved_at: null
    },
    {
        vendor_id: 6,
        title: 'Unverified audit remediation',
        description: 'Outstanding audit recommendations require confirmation to ensure identified control weaknesses have been addressed.',
        risk_level: 'medium',
        status: 'in_progress',
        date_identified: '2026-09-05',
        last_reviewed_at: '2026-10-03 13:15:00',
        resolved_at: null
    },
    {
        vendor_id: 7,
        title: 'Supplier account compromise',
        description: 'Unauthorised access to the supplier ordering account could result in fraudulent purchases or disclosure of order information.',
        risk_level: 'low',
        status: 'resolved',
        date_identified: '2026-06-20',
        last_reviewed_at: '2026-07-01 09:30:00',
        resolved_at: '2026-07-01 09:30:00'
    },
    {
        vendor_id: 8,
        title: 'Insufficient security awareness assurance',
        description: 'Security awareness and data handling expectations for supplier personnel have not yet been formally confirmed.',
        risk_level: 'low',
        status: 'open',
        date_identified: '2026-10-01',
        last_reviewed_at: null,
        resolved_at: null
    }
];

module.exports = vendorRisksData;
