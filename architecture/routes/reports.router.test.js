const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const express = require('express');
const reportDataModels = require('../models/reportData.models');
const reportsRouter = require('./reports.router');

const app = express();
app.use('/api/reports', reportsRouter);

let server;
let baseUrl;

before(() => new Promise((resolve) => {
    server = app.listen(0, () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
    });
}));

after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
}));

test('report endpoint rejects unsupported types with a 400 response', () => {
    return fetch(`${baseUrl}/api/reports/unsupported/data?period_start=2026-09-01&period_end=2026-09-30`)
        .then((response) => {
            assert.equal(response.status, 400);
            return response.json();
        })
        .then((body) => {
            assert.deepEqual(body, { error: 'Unsupported report type: unsupported' });
        });
});

test('report endpoint validates required period query parameters', () => {
    return fetch(`${baseUrl}/api/reports/project_status/data?period_start=2026-02-30&period_end=2026-03-01`)
        .then((response) => {
            assert.equal(response.status, 400);
            return response.json();
        })
        .then((body) => {
            assert.deepEqual(body, {
                error: 'period_start must be a valid ISO date in YYYY-MM-DD format.'
            });
        });
});

test('PDF endpoint rejects unsupported report types with a 400 response', () => {
    return fetch(`${baseUrl}/api/reports/unsupported/pdf?period_start=2026-09-01&period_end=2026-09-30`)
        .then((response) => {
            assert.equal(response.status, 400);
            return response.json();
        })
        .then((body) => {
            assert.deepEqual(body, { error: 'Unsupported report type: unsupported' });
        });
});

test('PDF endpoint returns an inline PDF generated from report data', () => {
    const originalFetchProjectStatusData = reportDataModels.fetchProjectStatusData;
    reportDataModels.fetchProjectStatusData = () => Promise.resolve([
        { status: 'in_progress' },
        { status: 'completed' }
    ]);

    return fetch(`${baseUrl}/api/reports/project_status/pdf?period_start=2026-09-01&period_end=2026-09-30`)
        .then((response) => {
            assert.equal(response.status, 200);
            assert.match(response.headers.get('content-type'), /application\/pdf/);
            assert.match(response.headers.get('content-disposition'), /^inline;/);
            return response.arrayBuffer();
        })
        .then((body) => {
            const pdf = Buffer.from(body);
            assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
        })
        .finally(() => {
            reportDataModels.fetchProjectStatusData = originalFetchProjectStatusData;
        });
});

test('management PDF combines metrics from all report types', () => {
    const originals = {
        fetchVulnerabilitySummaryData: reportDataModels.fetchVulnerabilitySummaryData,
        fetchVendorRiskReportData: reportDataModels.fetchVendorRiskReportData,
        fetchProjectStatusData: reportDataModels.fetchProjectStatusData,
        fetchSecurityActivityData: reportDataModels.fetchSecurityActivityData,
        fetchThreatIntelligenceData: reportDataModels.fetchThreatIntelligenceData
    };

    reportDataModels.fetchVulnerabilitySummaryData = () => Promise.resolve({
        open_vulnerabilities: [{ severity: 'Critical' }],
        priority_vulnerabilities: [{
            title: 'Critical API vulnerability',
            description: 'Service is externally reachable.',
            severity: 'Critical',
            status: 'Open'
        }],
        identified_during_period: 5,
        remediated_during_period: 2
    });
    reportDataModels.fetchVendorRiskReportData = () => Promise.resolve({
        total_vendors: 8,
        open_risks: [{ risk_level: 'high' }],
        priority_risks: [{
            title: 'Supplier access control gap',
            vendor_name: 'Example Supplier',
            description: 'Administrative access requires review.',
            risk_level: 'high',
            status: 'open'
        }],
        risks_created_during_period: 2,
        risks_closed_during_period: 1
    });
    reportDataModels.fetchProjectStatusData = () => Promise.resolve([
        { status: 'in_progress' }
    ]);
    reportDataModels.fetchSecurityActivityData = () => Promise.resolve({
        security_projects_updated: 1,
        audit_events: 4,
        status_changes: 2,
        recent_audit_events: [],
        recent_status_changes: []
    });
    reportDataModels.fetchThreatIntelligenceData = () => Promise.resolve({
        articles_collected_during_period: 7,
        relevant_articles: 3,
        priority_articles: [{
            title: 'Active exploitation of exposed systems',
            description: 'Review patch status and external exposure.',
            source: 'Example Threat Research',
            severity: 'critical',
            status: 'tracking',
            threat_score: 95
        }]
    });

    return fetch(`${baseUrl}/api/reports/management_summary/pdf?period_start=2026-09-01&period_end=2026-09-30`)
        .then((response) => {
            assert.equal(response.status, 200);
            assert.match(response.headers.get('content-type'), /application\/pdf/);
            return response.arrayBuffer();
        })
        .then((body) => {
            const pdf = Buffer.from(body);
            assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
            assert.ok((pdf.toString('latin1').match(/\/Type \/Page\b/g) || []).length > 1);
        })
        .finally(() => {
            Object.assign(reportDataModels, originals);
        });
});
