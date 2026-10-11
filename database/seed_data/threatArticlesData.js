
const threatArticlesData = [
    {
        title: 'Critical Remote Code Execution Vulnerability in Enterprise Software',
        description: 'A fictional advisory describes a remote code execution vulnerability that could allow an unauthenticated attacker to execute commands on a vulnerable server. Administrators should identify affected assets and prioritise vendor-approved patches.',
        article_url: 'https://example.com/threat-intel/enterprise-rce-001',
        source: 'Example Security Advisory',
        date_published: '2026-10-08 09:00:00',
        date_ingested: '2026-10-08 09:15:00',
        threat_score: 95.00,
        severity: 'critical',
        status: 'tracking'
    },
    {
        title: 'Active Exploitation of Internet-Facing VPN Appliances',
        description: 'A fictional threat report describes attackers exploiting unpatched VPN appliances to gain initial access to corporate networks. Review external exposure, patch status, authentication controls, and available security telemetry.',
        article_url: 'https://example.com/threat-intel/vpn-exploitation-002',
        source: 'Example Threat Research',
        date_published: '2026-10-07 14:30:00',
        date_ingested: '2026-10-07 15:00:00',
        threat_score: 89.50,
        severity: 'critical',
        status: 'tracking'
    },
    {
        title: 'Ransomware Group Targets Unpatched Windows Servers',
        description: 'A fictional report highlights ransomware operators targeting vulnerable Windows servers. Recommended actions include prioritising security updates, checking endpoint protection coverage, and validating backup recovery procedures.',
        article_url: 'https://example.com/threat-intel/windows-ransomware-003',
        source: 'Example Threat Research',
        date_published: '2026-10-06 11:00:00',
        date_ingested: '2026-10-06 11:20:00',
        threat_score: 86.00,
        severity: 'high',
        status: 'tracking'
    },
    {
        title: 'Phishing Campaign Uses Fake Microsoft 365 Login Pages',
        description: 'A fictional campaign uses convincing login pages to capture employee credentials. Review email filtering, user reporting processes, identity protection alerts, and phishing awareness guidance.',
        article_url: 'https://example.com/threat-intel/m365-phishing-004',
        source: 'Example Security Blog',
        date_published: '2026-10-05 08:45:00',
        date_ingested: '2026-10-05 09:10:00',
        threat_score: 72.00,
        severity: 'high',
        status: 'tracking'
    },
    {
        title: 'Privilege Escalation Vulnerability in Endpoint Software',
        description: 'A fictional advisory describes a local privilege escalation issue that may allow a standard user to obtain elevated permissions on affected endpoints. Confirm software versions and assess available mitigations.',
        article_url: 'https://example.com/threat-intel/endpoint-privesc-005',
        source: 'Example Security Advisory',
        date_published: '2026-10-04 12:00:00',
        date_ingested: '2026-10-04 12:30:00',
        threat_score: 68.00,
        severity: 'high',
        status: 'new'
    },
    {
        title: 'Malicious Browser Extensions Steal Session Information',
        description: 'A fictional report describes malicious browser extensions attempting to collect browsing data and authentication session information. Review browser extension controls and application deployment policies.',
        article_url: 'https://example.com/threat-intel/browser-extension-006',
        source: 'Example Security Blog',
        date_published: '2026-10-03 10:00:00',
        date_ingested: '2026-10-03 10:20:00',
        threat_score: 57.50,
        severity: 'medium',
        status: 'new'
    },
    {
        title: 'Exposed Management Interface Increases Network Risk',
        description: 'A fictional advisory recommends removing unnecessary internet exposure of administrative interfaces and restricting management access to authorised networks and accounts.',
        article_url: 'https://example.com/threat-intel/exposed-management-007',
        source: 'Example Security Advisory',
        date_published: '2026-10-02 09:30:00',
        date_ingested: '2026-10-02 10:00:00',
        threat_score: 53.00,
        severity: 'medium',
        status: 'new'
    },
    {
        title: 'Credential Stuffing Attempts Against Public-Facing Services',
        description: 'A fictional report describes automated login attempts using previously compromised credentials. Review sign-in telemetry, rate limiting, MFA coverage, and account lockout protections.',
        article_url: 'https://example.com/threat-intel/credential-stuffing-008',
        source: 'Example Threat Research',
        date_published: '2026-10-01 16:00:00',
        date_ingested: '2026-10-01 16:25:00',
        threat_score: 48.00,
        severity: 'medium',
        status: 'tracking'
    },
    {
        title: 'Security Update Addresses Low-Impact Information Disclosure',
        description: 'A fictional vendor notice describes an information disclosure vulnerability with limited impact under specific conditions. Review affected versions and schedule remediation according to organisational risk.',
        article_url: 'https://example.com/threat-intel/information-disclosure-009',
        source: 'Example Vendor Notice',
        date_published: '2026-09-28 13:00:00',
        date_ingested: '2026-09-28 13:15:00',
        threat_score: 28.00,
        severity: 'low',
        status: 'resolved'
    },
    {
        title: 'Outdated Software Library Reaches End of Support',
        description: 'A fictional notice highlights an unsupported software dependency. Identify affected applications, assess exposure, and plan an upgrade or documented risk acceptance.',
        article_url: 'https://example.com/threat-intel/unsupported-library-010',
        source: 'Example Vendor Notice',
        date_published: '2026-09-25 10:00:00',
        date_ingested: '2026-09-25 10:30:00',
        threat_score: 22.00,
        severity: 'low',
        status: 'dismissed'
    }
];

module.exports = threatArticlesData;
