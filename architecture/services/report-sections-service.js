const charts = require('./report-chart-service');

const DOCUMENT_TYPES = ['management_summary', 'vulnerability_summary', 'vendor_risk', 'project_status'];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthLabel = (month) => `${MONTH_NAMES[Number(month.slice(5, 7)) - 1]} ${month.slice(0, 4)}`;

const HIDDEN_METADATA = /(_id|created_at|updated_at)$/;

const cleanDetails = (details) => {
    if (!details) return null;
    return {
        heading: details.heading || 'Key records',
        intro: details.intro || '',
        emptyMessage: details.empty_message || 'No records to list.',
        items: (details.items || []).map((item) => ({
            title: item.title,
            subtitle: item.subtitle,
            description: item.description,
            meta: Object.entries(item.metadata || {})
                .filter(([key, value]) => !HIDDEN_METADATA.test(key) && value !== null && value !== undefined && value !== '' && value !== 'Not recorded')
                .map(([key, value]) => [
                    charts.formatLabel(key),
                    value instanceof Date ? value.toISOString().slice(0, 10) : String(value).replace(/T.*$/, '')
                ])
        }))
    };
};

const sumValues = (values) => values.reduce((total, value) => total + (value || 0), 0);

const vulnerabilitySection = async (metrics, details) => ({
    key: 'vulnerabilities',
    title: 'Vulnerabilities',
    blocks: [
        {
            type: 'image',
            image: await charts.statCards([
                { label: 'Open at period end', value: metrics.total_open },
                { label: 'Identified in period', value: metrics.identified_during_period },
                { label: 'Remediated in period', value: metrics.remediated_during_period }
            ])
        },
        { type: 'image', image: await charts.barChart({ title: 'Open vulnerabilities by severity', data: metrics.severity_breakdown, colours: charts.LEVEL_COLOURS }) },
        { type: 'records', details: cleanDetails(details) }
    ]
});

const vendorSection = async (metrics, details) => ({
    key: 'vendor_risk',
    title: 'Vendor risk',
    blocks: [
        {
            type: 'image',
            image: await charts.statCards([
                { label: 'Vendors', value: metrics.total_vendors },
                { label: 'Open risks at period end', value: metrics.open_risks },
                { label: 'Risks identified in period', value: metrics.risks_created_during_period },
                { label: 'Risks closed in period', value: metrics.risks_closed_during_period }
            ])
        },
        { type: 'image', image: await charts.barChart({ title: 'Open vendor risks by level', data: metrics.risk_level_breakdown, colours: charts.LEVEL_COLOURS }) },
        { type: 'records', details: cleanDetails(details) }
    ]
});

const projectSection = async (metrics, details) => ({
    key: 'projects',
    title: 'Projects',
    blocks: [
        { type: 'image', image: await charts.statCards([{ label: 'Total projects', value: metrics.total_projects }]) },
        { type: 'image', image: await charts.barChart({ title: 'Projects by status', data: metrics.status_breakdown, colours: charts.STATUS_COLOURS }) },
        { type: 'records', details: cleanDetails(details) }
    ]
});

const ticketSection = async (tickets) => {
    const months = (tickets && tickets.months) || [];
    const hasData = months.some((month) => month.total_opened !== null || Object.keys(month.categories).length > 0);
    if (!hasData) return null;

    const totals = months.map((month) => month.total_opened);
    const categoryTotals = {};
    months.forEach((month) => {
        Object.entries(month.categories).forEach(([category, count]) => {
            categoryTotals[category] = (categoryTotals[category] || 0) + count;
        });
    });
    const categoryItems = Object.entries(categoryTotals)
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    const blocks = [
        {
            type: 'image',
            image: await charts.statCards([
                { label: 'Tickets opened in period', value: sumValues(totals) },
                { label: 'Categorised tickets', value: sumValues(categoryItems.map(([, count]) => count)) }
            ])
        },
        {
            type: 'image',
            image: await charts.columnChart({
                title: 'Tickets opened per month',
                items: months.map((month) => ({ label: monthLabel(month.month), value: month.total_opened }))
            })
        }
    ];
    if (categoryItems.length) {
        blocks.push({
            type: 'image',
            image: await charts.barChart({
                title: 'Tickets by category',
                data: Object.fromEntries(categoryItems),
                labelWidth: 330
            })
        });
    }
    return { key: 'tickets', title: 'Cyber security tickets', blocks };
};

const phishingSection = async (phishing) => {
    if (!phishing || phishing.length === 0) return null;
    const learners = sumValues(phishing.map((campaign) => campaign.learners));
    const weighted = (field) => (learners
        ? Math.round((sumValues(phishing.map((campaign) => campaign[field] * campaign.learners)) / learners) * 10) / 10
        : 0);
    return {
        key: 'phishing',
        title: 'Phishing campaign results',
        blocks: [
            {
                type: 'image',
                image: await charts.statCards([
                    { label: 'Teams tested', value: phishing.length },
                    { label: 'Learners', value: learners },
                    { label: 'Average open rate', value: `${weighted('open_rate')}%` },
                    { label: 'Average phish rate', value: `${weighted('phish_rate')}%` }
                ])
            },
            { type: 'image', image: await charts.phishingChart(phishing) },
            { type: 'note', text: 'Averages are weighted by the number of learners in each team.' }
        ]
    };
};

const socSection = (soc) => {
    if (!soc || (!soc.summary && !soc.screenshot)) return null;
    const blocks = [];
    if (soc.summary) blocks.push({ type: 'text', text: soc.summary });
    if (soc.screenshot) blocks.push({ type: 'screenshot', data: soc.screenshot.data, width: soc.screenshot.width, height: soc.screenshot.height });
    return { key: 'soc', title: 'SOC report', blocks };
};

const buildSections = async (report) => {
    const type = report.metadata.report_type;
    const inputs = report.inputs || {};
    const sections = [];

    if (type === 'management_summary') {
        const { vulnerability_summary: vulns, vendor_risk: vendors, project_status: projects } = report.metrics || {};
        const details = report.details || {};
        if (vulns) sections.push(await vulnerabilitySection(vulns, details.vulnerability_summary));
        if (vendors) sections.push(await vendorSection(vendors, details.vendor_risk));
        if (projects) sections.push(await projectSection(projects, details.project_status));
    } else if (type === 'vulnerability_summary') {
        sections.push(await vulnerabilitySection(report.metrics, report.details));
    } else if (type === 'vendor_risk') {
        sections.push(await vendorSection(report.metrics, report.details));
    } else if (type === 'project_status') {
        sections.push(await projectSection(report.metrics, report.details));
    }

    if (type === 'management_summary') {
        [await ticketSection(inputs.tickets), await phishingSection(inputs.phishing), socSection(inputs.soc)]
            .filter(Boolean)
            .forEach((section) => sections.push(section));
    }
    return sections;
};

const reportTitle = (report) => report.title || (report.metadata.report_type === 'management_summary'
    ? 'Security Management Report'
    : `${charts.formatLabel(report.metadata.report_type)} Report`);

module.exports = { DOCUMENT_TYPES, buildSections, reportTitle };
