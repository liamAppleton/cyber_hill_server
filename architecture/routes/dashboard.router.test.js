const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const express = require('express');
const reportDataModels = require('../models/reportData.models');
const reportDataService = require('../services/report-data-service');
const dashboardRouter = require('./dashboard.router');

const app = express();
app.use('/api/dashboard', dashboardRouter);

const originals = {
    generateReportData: reportDataService.generateReportData,
    fetchProjectActivityData: reportDataModels.fetchProjectActivityData,
    fetchThreatArticleTrends: reportDataModels.fetchThreatArticleTrends,
    fetchRecentDashboardActivity: reportDataModels.fetchRecentDashboardActivity
};
let server;
let baseUrl;

before(() => new Promise((resolve) => {
    reportDataService.generateReportData = (reportType, periodStart, periodEnd) => (
        Promise.resolve({
            metrics: { report_type: reportType },
            limitations: [],
            period_start: periodStart,
            period_end: periodEnd
        })
    );
    reportDataModels.fetchProjectActivityData = () => Promise.resolve({
        security_projects_updated: 2,
        status_changes: 3
    });
    reportDataModels.fetchThreatArticleTrends = () => Promise.resolve([
        { month: '2026-09', severity: 'high', count: 2 }
    ]);
    reportDataModels.fetchRecentDashboardActivity = () => Promise.resolve({
        recent_actions: [{ event_id: 1, action: 'record_updated' }],
        recent_status_changes: [{ event_id: 2, new_status: 'in_progress' }]
    });

    server = app.listen(0, () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
    });
}));

after(() => new Promise((resolve, reject) => {
    reportDataService.generateReportData = originals.generateReportData;
    reportDataModels.fetchProjectActivityData = originals.fetchProjectActivityData;
    reportDataModels.fetchThreatArticleTrends = originals.fetchThreatArticleTrends;
    reportDataModels.fetchRecentDashboardActivity = originals.fetchRecentDashboardActivity;
    server.close((error) => error ? reject(error) : resolve());
}));

test('serves all dashboard views using the selected period', () => {
    const dashboardTypes = [
        'summary',
        'threat-intelligence',
        'vulnerabilities',
        'vendor-risks',
        'projects',
        'activity'
    ];

    return Promise.all(dashboardTypes.map((type) => (
        fetch(`${baseUrl}/api/dashboard/${type}?period_start=2026-09-01&period_end=2026-09-30`)
            .then((response) => {
                assert.equal(response.status, 200);
                return response.json();
            })
            .then(({ dashboard }) => {
                assert.equal(dashboard.period_start, '2026-09-01');
                assert.equal(dashboard.period_end, '2026-09-30');
                return dashboard;
            })
    ))).then((dashboards) => {
        const threatDashboard = dashboards[1];
        assert.equal(
            threatDashboard.trends.monthly_articles[0].severity_breakdown.high,
            2
        );
        assert.deepEqual(dashboards[4].activity, {
            security_projects_updated: 2,
            status_changes: 3
        });
        assert.equal(dashboards[5].recent_actions.length, 1);
        assert.equal(dashboards[0].vulnerabilities.metrics.report_type, 'vulnerability_summary');
    });
});

test('uses the default period and six-month threat trend when dates are omitted', () => (
    fetch(`${baseUrl}/api/dashboard/threat-intelligence`)
        .then((response) => {
            assert.equal(response.status, 200);
            return response.json();
        })
        .then(({ dashboard }) => {
            assert.ok(dashboard.period_start);
            assert.ok(dashboard.period_end);
            assert.equal(dashboard.trends.monthly_articles.length, 6);
            assert.equal(dashboard.trends.period_start.slice(-2), '01');
        })
));

test('dashboard period parameters must be provided together and be valid dates', () => Promise.all([
    fetch(`${baseUrl}/api/dashboard/vulnerabilities?period_start=2026-09-01`)
        .then((response) => {
            assert.equal(response.status, 400);
            return response.json();
        })
        .then((body) => {
            assert.deepEqual(body, {
                error: 'period_start and period_end must be provided together.'
            });
        }),
    fetch(`${baseUrl}/api/dashboard/projects?period_start=2026-02-30&period_end=2026-03-01`)
        .then((response) => {
            assert.equal(response.status, 400);
            return response.json();
        })
        .then((body) => {
            assert.match(body.error, /valid ISO date/);
        })
]));
