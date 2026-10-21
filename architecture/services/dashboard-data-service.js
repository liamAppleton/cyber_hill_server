const reportDataService = require('./report-data-service');
const reportDataModels = require('../models/reportData.models');
const { validatePeriod } = reportDataService;

const formatDate = (date) => [
    String(date.getUTCFullYear()).padStart(4, '0'),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0')
].join('-');

const badRequestError = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const getDefaultPeriod = () => {
    const end = new Date();
    const start = new Date(Date.UTC(
        end.getUTCFullYear(),
        end.getUTCMonth(),
        end.getUTCDate() - 29
    ));

    return {
        periodStart: formatDate(start),
        periodEnd: formatDate(end)
    };
};

const getDashboardPeriod = (periodStart, periodEnd) => {
    let period;

    if (periodStart === undefined && periodEnd === undefined) {
        period = getDefaultPeriod();
    } else if (periodStart === undefined || periodEnd === undefined) {
        throw badRequestError('period_start and period_end must be provided together.');
    } else {
        period = { periodStart, periodEnd };
    }

    const validatedPeriod = validatePeriod(period.periodStart, period.periodEnd);
    return {
        periodStart: validatedPeriod.periodStart,
        periodEnd: validatedPeriod.periodEnd
    };
};

const getPeriodEndExclusive = (periodEnd) => {
    const end = new Date(`${periodEnd}T00:00:00.000Z`);
    end.setUTCDate(end.getUTCDate() + 1);

    return end.getUTCFullYear() > 9999
        ? null
        : formatDate(end);
};

const getDefaultTrendPeriod = () => {
    const currentDate = new Date();
    const trendStart = new Date(Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth() - 5,
        1
    ));

    return {
        periodStart: formatDate(trendStart),
        periodEnd: formatDate(currentDate)
    };
};

const getTrendMonths = (periodStart, periodEnd) => {
    const start = new Date(`${periodStart}T00:00:00.000Z`);
    const end = new Date(`${periodEnd}T00:00:00.000Z`);
    const months = [];

    for (
        let current = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
        current <= end;
        current.setUTCMonth(current.getUTCMonth() + 1)
    ) {
        months.push(formatDate(current).slice(0, 7));
    }

    return months;
};

const buildThreatTrends = (rows, periodStart, periodEnd) => {
    const months = getTrendMonths(periodStart, periodEnd).map((month) => ({
        month,
        total: 0,
        severity_breakdown: {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        }
    }));
    const monthByName = new Map(months.map((month) => [month.month, month]));

    rows.forEach(({ month, severity, count }) => {
        const trend = monthByName.get(month);
        const normalizedSeverity = typeof severity === 'string'
            ? severity.toLowerCase()
            : '';

        if (!trend) {
            return;
        }

        trend.total += Number(count);
        if (Object.prototype.hasOwnProperty.call(trend.severity_breakdown, normalizedSeverity)) {
            trend.severity_breakdown[normalizedSeverity] += Number(count);
        }
    });

    return months;
};

const getReportMetrics = (reportType, period) => (
    reportDataService.generateReportData(
        reportType,
        period.periodStart,
        period.periodEnd
    ).then(({ metrics, limitations }) => ({ metrics, limitations }))
);

const getDashboardVulnerabilities = (period) => (
    getReportMetrics('vulnerability_summary', period)
        .then((report) => ({
            period_start: period.periodStart,
            period_end: period.periodEnd,
            ...report
        }))
);

const getDashboardVendorRisks = (period) => (
    getReportMetrics('vendor_risk', period)
        .then((report) => ({
            period_start: period.periodStart,
            period_end: period.periodEnd,
            ...report
        }))
);

const getDashboardProjects = (period) => Promise.all([
    getReportMetrics('project_status', period),
    reportDataModels.fetchProjectActivityData(
        period.periodStart,
        getPeriodEndExclusive(period.periodEnd)
    )
]).then(([report, activity]) => ({
    period_start: period.periodStart,
    period_end: period.periodEnd,
    metrics: report.metrics,
    activity,
    limitations: [
        'Project activity counts include only recorded audit_log and status_history events.'
    ]
}));

const getDashboardThreatIntelligence = (period, trendPeriod) => Promise.all([
    getReportMetrics('threat_intelligence', period),
    reportDataModels.fetchThreatArticleTrends(
        trendPeriod.periodStart,
        getPeriodEndExclusive(trendPeriod.periodEnd)
    )
]).then(([report, trendRows]) => ({
    period_start: period.periodStart,
    period_end: period.periodEnd,
    metrics: report.metrics,
    trends: {
        period_start: trendPeriod.periodStart,
        period_end: trendPeriod.periodEnd,
        monthly_articles: buildThreatTrends(
            trendRows,
            trendPeriod.periodStart,
            trendPeriod.periodEnd
        )
    },
    limitations: report.limitations
}));

const getDashboardActivity = (period) => Promise.all([
    getReportMetrics('security_activity', period),
    reportDataModels.fetchRecentDashboardActivity()
]).then(([report, recentActivity]) => ({
    period_start: period.periodStart,
    period_end: period.periodEnd,
    metrics: report.metrics,
    ...recentActivity,
    limitations: report.limitations
}));

const getDashboardSummary = (period, trendPeriod) => Promise.all([
    getDashboardVulnerabilities(period),
    getDashboardVendorRisks(period),
    getDashboardProjects(period),
    getDashboardThreatIntelligence(period, trendPeriod),
    getDashboardActivity(period)
]).then(([
    vulnerabilities,
    vendorRisks,
    projects,
    threatIntelligence,
    activity
]) => ({
    period_start: period.periodStart,
    period_end: period.periodEnd,
    vulnerabilities,
    vendor_risks: vendorRisks,
    projects,
    threat_intelligence: threatIntelligence,
    activity
}));

const getDashboardData = (dashboardType, periodStart, periodEnd) => {
    let period;

    try {
        period = getDashboardPeriod(periodStart, periodEnd);
    } catch (error) {
        return Promise.reject(error);
    }

    const trendPeriod = periodStart === undefined && periodEnd === undefined
        ? getDefaultTrendPeriod()
        : period;

    const actions = {
        summary: () => getDashboardSummary(period, trendPeriod),
        'threat-intelligence': () => getDashboardThreatIntelligence(period, trendPeriod),
        vulnerabilities: () => getDashboardVulnerabilities(period),
        'vendor-risks': () => getDashboardVendorRisks(period),
        projects: () => getDashboardProjects(period),
        activity: () => getDashboardActivity(period)
    };

    if (!Object.prototype.hasOwnProperty.call(actions, dashboardType)) {
        return Promise.reject(badRequestError(`Unsupported dashboard: ${dashboardType}`));
    }

    return actions[dashboardType]();
};

module.exports = {
    getDashboardData,
    buildThreatTrends
};
