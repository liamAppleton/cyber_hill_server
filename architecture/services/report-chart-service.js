const sharp = require('sharp');

const FONT = "Liberation Sans, Helvetica, Arial, sans-serif";
const COLOURS = {
    navy: '#0B2545',
    ink: '#1B2A3A',
    muted: '#5B6B7B',
    card: '#F1F6FB',
    border: '#D5E2EF',
    track: '#E6EEF6',
    blue: '#2F8FD8',
    cyan: '#17B3C9'
};
const LEVEL_COLOURS = {
    critical: '#E5484D',
    high: '#F08A24',
    medium: '#E9B72D',
    low: '#4AA3DF'
};
const STATUS_COLOURS = {
    not_started: '#8A99A8',
    in_progress: '#2F8FD8',
    on_hold: '#E9B72D',
    completed: '#2FA866',
    cancelled: '#B65B5B'
};
const SERIES_COLOURS = ['#2F8FD8', '#E5484D'];

const escapeXml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
}[character]));

const truncate = (text, max) => (String(text).length > max ? `${String(text).slice(0, max - 1)}…` : String(text));

const formatLabel = (value) => String(value)
    .replace(/_/g, ' ')
    .replace(/^./, (character) => character.toUpperCase());

const svgDocument = (width, height, body) => (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="${FONT}">` +
    `<rect width="${width}" height="${height}" fill="#FFFFFF"/>${body}</svg>`
);

// Rasterises at 2x so charts stay sharp when printed.
const toPng = (svg, width, height) => sharp(Buffer.from(svg), { density: 192 })
    .png()
    .toBuffer()
    .then((data) => ({ data, width, height }));

const card = (width, height) => (
    `<rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="12" fill="#FFFFFF" stroke="${COLOURS.border}" stroke-width="2"/>`
);

const statCards = (stats, width = 1000) => {
    const columns = Math.min(Math.max(stats.length, 1), 4);
    const gap = 16;
    const cardWidth = (width - gap * (columns - 1)) / columns;
    const cardHeight = 112;
    const rows = Math.ceil(stats.length / columns);
    const height = rows * cardHeight + (rows - 1) * gap;

    const body = stats.map((stat, index) => {
        const x = (index % columns) * (cardWidth + gap);
        const y = Math.floor(index / columns) * (cardHeight + gap);
        return (
            `<rect x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" rx="12" fill="${COLOURS.card}" stroke="${COLOURS.border}" stroke-width="2"/>` +
            `<rect x="${x}" y="${y + 18}" width="5" height="${cardHeight - 36}" rx="2.5" fill="${COLOURS.blue}"/>` +
            `<text x="${x + 24}" y="${y + 60}" font-size="42" font-weight="700" fill="${COLOURS.navy}">${escapeXml(stat.value ?? '-')}</text>` +
            `<text x="${x + 24}" y="${y + 91}" font-size="16" fill="${COLOURS.muted}">${escapeXml(truncate(stat.label, 30))}</text>`
        );
    }).join('');

    return toPng(svgDocument(width, height, body), width, height);
};

// Horizontal bars. Each item has `values` (one per series) and a label.
const horizontalBars = ({
    title,
    items,
    series = [{ name: '', colour: COLOURS.blue }],
    unit = '',
    max,
    labelWidth = 250,
    width = 1000
}) => {
    const barHeight = series.length > 1 ? 16 : 20;
    const rowHeight = series.length * barHeight + (series.length > 1 ? 18 : 14);
    const top = series.length > 1 ? 86 : 62;
    const height = top + items.length * rowHeight + 18;
    const scaleMax = Math.max(1, max ?? Math.max(...items.flatMap((item) => item.values)));
    const barLeft = labelWidth + 24;
    const barWidth = width - barLeft - 90;

    let body = card(width, height);
    body += `<text x="28" y="40" font-size="20" font-weight="700" fill="${COLOURS.navy}">${escapeXml(title)}</text>`;

    if (series.length > 1) {
        series.forEach((entry, index) => {
            const x = 28 + index * 170;
            body += `<rect x="${x}" y="56" width="14" height="14" rx="3" fill="${entry.colour}"/>` +
                `<text x="${x + 22}" y="68" font-size="14" fill="${COLOURS.muted}">${escapeXml(entry.name)}</text>`;
        });
    }

    items.forEach((item, rowIndex) => {
        const y = top + rowIndex * rowHeight;
        const labelY = y + (series.length * barHeight) / 2 + 5;
        body += `<text x="28" y="${labelY}" font-size="16" fill="${COLOURS.ink}">${escapeXml(truncate(item.label, Math.floor(labelWidth / 8.2)))}</text>`;
        item.values.forEach((value, seriesIndex) => {
            const barY = y + seriesIndex * barHeight;
            const fill = item.colour && series.length === 1 ? item.colour : series[seriesIndex].colour;
            const length = value > 0 ? Math.max(4, (value / scaleMax) * barWidth) : 0;
            body += `<rect x="${barLeft}" y="${barY}" width="${barWidth}" height="${barHeight - 3}" rx="4" fill="${COLOURS.track}"/>`;
            if (length) body += `<rect x="${barLeft}" y="${barY}" width="${length}" height="${barHeight - 3}" rx="4" fill="${fill}"/>`;
            body += `<text x="${barLeft + barWidth + 12}" y="${barY + barHeight - 5}" font-size="15" font-weight="700" fill="${COLOURS.ink}">${escapeXml(value)}${unit}</text>`;
        });
    });

    return toPng(svgDocument(width, height, body), width, height);
};

const barChart = ({ title, data, colours = {}, width = 1000, labelWidth }) => horizontalBars({
    title,
    items: Object.entries(data || {}).map(([key, value]) => ({
        label: formatLabel(key),
        values: [value],
        colour: colours[key]
    })),
    width,
    labelWidth: labelWidth || 250
});

const columnChart = ({ title, items, width = 1000, height = 340 }) => {
    const top = 90;
    const bottom = 52;
    const plotHeight = height - top - bottom;
    const scaleMax = Math.max(1, ...items.map((item) => item.value || 0));
    const slot = (width - 80) / Math.max(items.length, 1);
    const barWidth = Math.min(90, slot * 0.6);

    let body = card(width, height);
    body += `<text x="28" y="40" font-size="20" font-weight="700" fill="${COLOURS.navy}">${escapeXml(title)}</text>`;
    body += `<line x1="40" y1="${top + plotHeight}" x2="${width - 40}" y2="${top + plotHeight}" stroke="${COLOURS.border}" stroke-width="2"/>`;

    items.forEach((item, index) => {
        const x = 40 + index * slot + (slot - barWidth) / 2;
        const value = item.value || 0;
        const barHeight = value > 0 ? Math.max(4, (value / scaleMax) * plotHeight) : 0;
        const y = top + plotHeight - barHeight;
        if (barHeight) body += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="5" fill="${COLOURS.blue}"/>`;
        body += `<text x="${x + barWidth / 2}" y="${y - 8}" font-size="16" font-weight="700" text-anchor="middle" fill="${COLOURS.ink}">${item.value === null || item.value === undefined ? '-' : escapeXml(value)}</text>`;
        body += `<text x="${x + barWidth / 2}" y="${top + plotHeight + 26}" font-size="15" text-anchor="middle" fill="${COLOURS.muted}">${escapeXml(truncate(item.label, 14))}</text>`;
    });

    return toPng(svgDocument(width, height, body), width, height);
};

const phishingChart = (campaigns) => horizontalBars({
    title: 'Phishing campaign results by team',
    items: campaigns.map((campaign) => ({
        label: `${campaign.team} (${campaign.learners} learners)`,
        values: [campaign.open_rate, campaign.phish_rate]
    })),
    series: [
        { name: 'Open rate', colour: SERIES_COLOURS[0] },
        { name: 'Phish rate', colour: SERIES_COLOURS[1] }
    ],
    unit: '%',
    max: 100,
    labelWidth: 330
});

module.exports = {
    COLOURS,
    LEVEL_COLOURS,
    STATUS_COLOURS,
    formatLabel,
    statCards,
    barChart,
    columnChart,
    phishingChart
};
