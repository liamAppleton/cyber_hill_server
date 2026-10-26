const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const db = require('../../database/db');

const SCREENSHOT_DIR = path.join(__dirname, '..', '..', 'uploads', 'soc');
const MAX_SUMMARY_LENGTH = 10000;
const MAX_COUNT = 1000000;
const MAX_PERIOD_DAYS = 400;

const TICKET_CATEGORIES = [
    'Account compromise',
    'Anomalous network activity',
    'Cyber Security',
    'DLP issue',
    'Email release',
    'Lost or stolen device',
    'Malware',
    'Out of date software',
    'Phishing email',
    'Test phishing email',
    'Password protected or BEC email',
    'SOC alert',
    'Social engineering attempt',
    'Software system vulnerability',
    'Suspend account',
    'Suspicious activity',
    'Unauthorised access',
    'Unsafe browsing behaviour'
];

const badRequest = (message) => ({ status: 400, message });

const parseDate = (value, name) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw badRequest(`${name} must be a date in YYYY-MM-DD format.`);
    }
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
        throw badRequest(`${name} must be a valid date.`);
    }
    return date;
};

const validatePeriod = (start, end) => {
    const startDate = parseDate(start, 'period_start');
    const endDate = parseDate(end, 'period_end');
    if (startDate > endDate) throw badRequest('period_start must not be after period_end.');
    if ((endDate - startDate) / 86400000 > MAX_PERIOD_DAYS) {
        throw badRequest(`The reporting period cannot be longer than ${MAX_PERIOD_DAYS} days.`);
    }
    return { start, end, startDate, endDate };
};

const monthsInPeriod = (startDate, endDate) => {
    const months = [];
    let year = startDate.getUTCFullYear();
    let month = startDate.getUTCMonth();
    while (year < endDate.getUTCFullYear() || (year === endDate.getUTCFullYear() && month <= endDate.getUTCMonth())) {
        months.push(`${year}-${String(month + 1).padStart(2, '0')}`);
        month += 1;
        if (month === 12) { month = 0; year += 1; }
    }
    return months;
};

const parseCount = (value, name, { allowBlank = false } = {}) => {
    if (allowBlank && (value === null || value === undefined || value === '')) return null;
    const number = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
    if (!Number.isInteger(number) || number < 0 || number > MAX_COUNT) {
        throw badRequest(`${name} must be a whole number between 0 and ${MAX_COUNT}.`);
    }
    return number;
};

const parseRate = (value, name) => {
    const number = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
    if (typeof number !== 'number' || !Number.isFinite(number) || number < 0 || number > 100) {
        throw badRequest(`${name} must be a percentage between 0 and 100.`);
    }
    return Math.round(number * 100) / 100;
};

const fetchReportInputs = async (periodStart, periodEnd) => {
    const { start, end, startDate, endDate } = validatePeriod(periodStart, periodEnd);
    const months = monthsInPeriod(startDate, endDate);
    const monthDates = months.map((month) => `${month}-01`);

    const [[socRows], [phishingRows], [monthRows], [categoryRows]] = await Promise.all([
        db.query('SELECT summary, screenshot_filename, updated_at FROM report_soc WHERE period_start = ? AND period_end = ?', [start, end]),
        db.query(
            `SELECT team, learners, open_rate, phish_rate
             FROM phishing_campaign_results
             WHERE period_start = ? AND period_end = ?
             ORDER BY phishing_campaign_result_id`,
            [start, end]
        ),
        db.query('SELECT month, total_opened FROM ticket_monthly_stats WHERE month IN (?)', [monthDates]),
        db.query('SELECT month, category, ticket_count FROM ticket_category_counts WHERE month IN (?)', [monthDates])
    ]);

    const soc = socRows[0]
        ? {
            summary: socRows[0].summary,
            has_screenshot: Boolean(socRows[0].screenshot_filename),
            updated_at: socRows[0].updated_at
        }
        : null;

    const ticketMonths = months.map((month) => {
        const total = monthRows.find((row) => String(row.month).slice(0, 7) === month);
        const categories = {};
        categoryRows
            .filter((row) => String(row.month).slice(0, 7) === month)
            .forEach((row) => { categories[row.category] = row.ticket_count; });
        return { month, total_opened: total ? total.total_opened : null, categories };
    });

    return {
        period_start: start,
        period_end: end,
        soc,
        phishing: phishingRows.map((row) => ({
            team: row.team,
            learners: row.learners,
            open_rate: Number(row.open_rate),
            phish_rate: Number(row.phish_rate)
        })),
        tickets: { categories: TICKET_CATEGORIES, months: ticketMonths }
    };
};

const screenshotPath = (filename) => path.join(SCREENSHOT_DIR, path.basename(filename));

const fetchSocScreenshot = async (periodStart, periodEnd) => {
    const { start, end } = validatePeriod(periodStart, periodEnd);
    const [rows] = await db.query(
        'SELECT screenshot_filename FROM report_soc WHERE period_start = ? AND period_end = ?',
        [start, end]
    );
    if (!rows[0] || !rows[0].screenshot_filename) return null;
    try {
        return await fs.readFile(screenshotPath(rows[0].screenshot_filename));
    } catch (error) {
        if (error.code === 'ENOENT') return null;
        throw error;
    }
};

const normaliseScreenshot = (buffer) => sharp(buffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .png()
    .toBuffer()
    .catch(() => { throw badRequest('The screenshot must be a valid PNG, JPEG or WebP image.'); });

const saveSocReport = async ({ period_start, period_end, summary, screenshot, remove_screenshot, user_id }) => {
    const { start, end } = validatePeriod(period_start, period_end);
    if (summary !== undefined && summary !== null && (typeof summary !== 'string' || summary.length > MAX_SUMMARY_LENGTH)) {
        throw badRequest(`summary must be text of at most ${MAX_SUMMARY_LENGTH} characters.`);
    }
    const text = typeof summary === 'string' && summary.trim() ? summary.trim() : null;

    const [existing] = await db.query(
        'SELECT screenshot_filename FROM report_soc WHERE period_start = ? AND period_end = ?',
        [start, end]
    );
    let filename = existing[0] ? existing[0].screenshot_filename : null;
    const previous = filename;

    if (screenshot) {
        const png = await normaliseScreenshot(screenshot);
        await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
        filename = `${crypto.randomUUID()}.png`;
        await fs.writeFile(screenshotPath(filename), png);
    } else if (remove_screenshot) {
        filename = null;
    }

    await db.query(
        `INSERT INTO report_soc (period_start, period_end, summary, screenshot_filename, updated_by)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE summary = VALUES(summary), screenshot_filename = VALUES(screenshot_filename), updated_by = VALUES(updated_by)`,
        [start, end, text, filename, user_id]
    );

    if (previous && previous !== filename) {
        await fs.rm(screenshotPath(previous), { force: true });
    }
    return { summary: text, has_screenshot: Boolean(filename) };
};

const savePhishingResults = async ({ period_start, period_end, campaigns, user_id }) => {
    const { start, end } = validatePeriod(period_start, period_end);
    if (!Array.isArray(campaigns) || campaigns.length > 100) {
        throw badRequest('campaigns must be a list of at most 100 results.');
    }
    const rows = campaigns.map((campaign, index) => {
        const label = `Result ${index + 1}`;
        const team = typeof campaign?.team === 'string' ? campaign.team.trim() : '';
        if (!team || team.length > 100) throw badRequest(`${label}: team is required (up to 100 characters).`);
        return [
            start, end, team,
            parseCount(campaign.learners, `${label}: learners`),
            parseRate(campaign.open_rate, `${label}: open rate`),
            parseRate(campaign.phish_rate, `${label}: phish rate`),
            user_id
        ];
    });

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('DELETE FROM phishing_campaign_results WHERE period_start = ? AND period_end = ?', [start, end]);
        if (rows.length) {
            await connection.query(
                `INSERT INTO phishing_campaign_results
                 (period_start, period_end, team, learners, open_rate, phish_rate, created_by) VALUES ?`,
                [rows]
            );
        }
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
    return rows.length;
};

const saveTicketMonth = async ({ month, total_opened, categories, user_id }) => {
    if (typeof month !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        throw badRequest('month must be in YYYY-MM format.');
    }
    if (categories !== undefined && (typeof categories !== 'object' || categories === null || Array.isArray(categories))) {
        throw badRequest('categories must be an object of category counts.');
    }
    const total = parseCount(total_opened, 'total_opened', { allowBlank: true });
    const counts = [];
    Object.entries(categories || {}).forEach(([category, value]) => {
        if (!TICKET_CATEGORIES.includes(category)) throw badRequest(`Unknown ticket category: ${category}`);
        const count = parseCount(value, category, { allowBlank: true });
        if (count !== null) counts.push([`${month}-01`, category, count]);
    });

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query(
            `INSERT INTO ticket_monthly_stats (month, total_opened, updated_by) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE total_opened = VALUES(total_opened), updated_by = VALUES(updated_by)`,
            [`${month}-01`, total, user_id]
        );
        await connection.query('DELETE FROM ticket_category_counts WHERE month = ?', [`${month}-01`]);
        if (counts.length) {
            await connection.query('INSERT INTO ticket_category_counts (month, category, ticket_count) VALUES ?', [counts]);
        }
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
    return { month, total_opened: total, categories: Object.fromEntries(counts.map(([, category, count]) => [category, count])) };
};

module.exports = {
    TICKET_CATEGORIES,
    fetchReportInputs,
    fetchSocScreenshot,
    saveSocReport,
    savePhishingResults,
    saveTicketMonth
};
