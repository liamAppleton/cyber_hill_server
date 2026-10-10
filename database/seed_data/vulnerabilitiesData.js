const vulnerabilitiesData = [
    {
        title: "Outdated OpenSSL Library",
        description: "The server is running an outdated OpenSSL library that requires review and patching.",
        cve: "CVE-2024-0001",
        cvss: 8.2,
        scanner_severity: "High",
        contextual_severity: "Critical",
        source: "OpenVAS",
        date_discovered: "2026-09-15 09:30:00",
        status: "Open",
        resolved_at: null
    },
    {
        title: "Missing Security Updates",
        description: "Several security updates are missing from the operating system.",
        cve: null,
        cvss: 6.5,
        scanner_severity: "Medium",
        contextual_severity: "High",
        source: "OpenVAS",
        date_discovered: "2026-09-18 11:15:00",
        status: "In Progress",
        resolved_at: null
    },
    {
        title: "Weak TLS Configuration",
        description: "The service supports outdated TLS protocols that should be disabled.",
        cve: null,
        cvss: 5.3,
        scanner_severity: "Medium",
        contextual_severity: "Medium",
        source: "Manual Assessment",
        date_discovered: "2026-09-20 14:00:00",
        status: "Open",
        resolved_at: null
    },
    {
        title: "Exposed Development Service",
        description: "A development service is accessible from a network where it is not required.",
        cve: null,
        cvss: 7.1,
        scanner_severity: "High",
        contextual_severity: "High",
        source: "OpenVAS",
        date_discovered: "2026-09-22 10:45:00",
        status: "Resolved",
        resolved_at: "2026-09-25 16:30:00"
    },
    {
        title: "Self-Signed TLS Certificate",
        description: "An internal service uses a self-signed certificate that may cause trust warnings.",
        cve: null,
        cvss: 3.1,
        scanner_severity: "Low",
        contextual_severity: "Low",
        source: "Manual Assessment",
        date_discovered: "2026-09-27 08:20:00",
        status: "Accepted Risk",
        resolved_at: null
    },
    {
        title: "Potential SQL Injection",
        description: "A web application input may be vulnerable to SQL injection and requires validation.",
        cve: null,
        cvss: 9.1,
        scanner_severity: "Critical",
        contextual_severity: "Critical",
        source: "Web Application Scan",
        date_discovered: "2026-10-01 13:10:00",
        status: "In Progress",
        resolved_at: null
    },
    {
        title: "Verbose Server Error Messages",
        description: "Error responses expose implementation details that could assist an attacker.",
        cve: null,
        cvss: 4.3,
        scanner_severity: "Medium",
        contextual_severity: "Low",
        source: "Manual Assessment",
        date_discovered: "2026-10-03 15:40:00",
        status: "Open",
        resolved_at: null
    },
    {
        title: "Unsupported Software Version",
        description: "An installed application version is no longer supported and may not receive security fixes.",
        cve: null,
        cvss: 7.8,
        scanner_severity: "High",
        contextual_severity: "High",
        source: "OpenVAS",
        date_discovered: "2026-10-05 09:00:00",
        status: "Resolved",
        resolved_at: "2026-10-08 12:00:00"
    }
];

module.exports = vulnerabilitiesData;