
const { parse } = require('csv-parse/sync');

const normaliseHeader = header => {
    return String(header || '')
        .replace(/^\uFEFF/, '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
};

const getField = (row, ...names) => {
    for (const name of names) {
        const value = row[normaliseHeader(name)];

        if (value !== undefined && String(value).trim() !== '') {
            return String(value).trim();
        }
    }

    return '';
};

const normaliseSeverity = value => {
    const severity = String(value || '').trim().toLowerCase();

    const severityMap = {
        critical: 'Critical',
        high: 'High',
        medium: 'Medium',
        moderate: 'Medium',
        low: 'Low',
        info: 'Info',
        informational: 'Info',
        log: 'Info',
        none: 'Info'
    };

    if (severityMap[severity]) {
        return severityMap[severity];
    }

    if (severity === '') return null;

    const score = Number(severity);

    if (!Number.isFinite(score) || score < 0 || score > 10) {
        return null;
    }

    if (score >= 9) return 'Critical';
    if (score >= 7) return 'High';
    if (score >= 4) return 'Medium';
    if (score > 0) return 'Low';

    return 'Info';
};

const parseCvss = value => {
    if (value === '') return null;

    const score = Number(value);

    if (!Number.isFinite(score) || score < 0 || score > 10) {
        return undefined;
    }

    return Math.round(score * 10) / 10;
};

const parsePort = (portValue, protocolValue) => {
    let port = String(portValue || '').trim();
    let protocol = String(protocolValue || '')
        .trim()
        .toLowerCase();

    // Supports values such as 443/tcp.
    if (port.includes('/')) {
        const parts = port.split('/');
        port = parts[0].trim();

        if (!protocol) {
            protocol = (parts[1] || '').trim().toLowerCase();
        }
    }

    if (!protocol) protocol = 'tcp';

    if (!['tcp', 'udp', 'icmp', 'unknown'].includes(protocol)) {
        return null;
    }

    // General or non-numeric ports are stored as 0.
    if (port === '' || !/^\d+$/.test(port)) {
        return {
            port: 0,
            port_protocol: protocol
        };
    }

    const numericPort = Number(port);

    if (numericPort < 0 || numericPort > 65535) {
        return null;
    }

    return {
        port: numericPort,
        port_protocol: protocol
    };
};

const parseDetectionDate = value => {
    // Use the import time when the CSV has no detection timestamp.
    if (!value) {
        return new Date();
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
};

const createCsvError = (message, details = {}) => {
    const error = new Error(message);
    error.statusCode = 400;
    error.details = details;

    return error;
};

const parseOpenvasCsv = buffer => {
    let rows;

    try {
        rows = parse(buffer, {
            bom: true,
            columns: headers => headers.map(normaliseHeader),
            skip_empty_lines: true,
            trim: true,
            relax_column_count: false
        });
    } catch (error) {
        throw createCsvError(
            'The CSV could not be parsed. Check its format and try again.'
        );
    }

    if (!rows.length) {
        throw createCsvError('The CSV file contains no findings.');
    }

    const headers = Object.keys(rows[0]);

    const requiredHeaders = [
        'hostname',
        'nvtoid',
        'severity'
    ];

    const missingHeaders = requiredHeaders.filter(
        header => !headers.includes(header)
    );

    // Accept either NVT Name or Name as the title column.
    if (!headers.includes('nvtname') && !headers.includes('name')) {
        missingHeaders.push('nvtname or name');
    }

    if (missingHeaders.length) {
        throw createCsvError(
            'The CSV is missing required columns.',
            { missing_columns: missingHeaders }
        );
    }

    let invalidRows = 0;

    const findings = rows.map(row => {
        const hostname = getField(row, 'Hostname');
        const nvtOid = getField(row, 'NVT OID');
        const title = getField(row, 'NVT Name', 'Name');

        const severity = normaliseSeverity(
            getField(row, 'Severity')
        );

        const cvss = parseCvss(
            getField(row, 'CVSS')
        );

        const description =
            getField(row, 'Summary') ||
            getField(row, 'Specific Result') ||
            '';

        const portData = parsePort(
            getField(row, 'Port'),
            getField(row, 'Port Protocol')
        );

        const dateDetected = parseDetectionDate(
            getField(row, 'Timestamp', 'Date Detected')
        );

        const invalid =
            !hostname ||
            !nvtOid ||
            !title ||
            !severity ||
            !portData ||
            cvss === undefined ||
            !dateDetected;

        if (invalid) {
            invalidRows++;
            return null;
        }

        return {
            hostname,
            nvt_oid: nvtOid,
            title,
            description,
            scanner_severity: severity,
            cvss,
            port: portData.port,
            port_protocol: portData.port_protocol,
            date_detected: dateDetected
        };
    }).filter(Boolean);

    return {
        findings,
        invalidRows
    };
};

module.exports = {
    parseOpenvasCsv
};
