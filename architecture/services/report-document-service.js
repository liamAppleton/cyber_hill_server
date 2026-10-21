const PDFDocument = require('pdfkit');

const COLORS = {
    navy: '#10243A',
    navyLight: '#1B3654',
    blue: '#1677C8',
    cyan: '#20B8C7',
    ink: '#1D2B3A',
    muted: '#65768A',
    subtle: '#F3F6F9',
    border: '#DCE4EC',
    white: '#FFFFFF',
    critical: '#B42318',
    high: '#D45B12',
    medium: '#B78103',
    low: '#27805A',
    neutral: '#55718D'
};

const SEVERITY_COLORS = {
    critical: COLORS.critical,
    high: COLORS.high,
    medium: COLORS.medium,
    low: COLORS.low
};

const PAGE = {
    width: 595.28,
    height: 841.89,
    margin: 48,
    contentWidth: 499.28,
    bottom: 760
};

const SECTION_TITLES = {
    vulnerability_summary: 'Vulnerability Exposure',
    vendor_risk: 'Third-Party Risk',
    project_status: 'Security Programme',
    security_activity: 'Security Operations',
    threat_intelligence: 'Threat Intelligence'
};

const formatLabel = (value) => String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

const formatValue = (value) => {
    if (typeof value === 'number') {
        return new Intl.NumberFormat('en-GB').format(value);
    }

    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().replace('T', ' ').replace(/:\d{2}\.\d{3}Z$/, ' UTC');
    }

    return String(value);
};

const formatMetadataValue = (key, value) => {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        if (key.endsWith('_date')) {
            return [
                value.getFullYear(),
                String(value.getMonth() + 1).padStart(2, '0'),
                String(value.getDate()).padStart(2, '0')
            ].join('-');
        }

        return value.toISOString().replace('T', ' ').replace(/:\d{2}\.\d{3}Z$/, ' UTC');
    }

    return formatValue(value);
};

const drawPageFooter = (document, pageNumber) => {
    const currentX = document.x;
    const currentY = document.y;
    document.save();
    document
        .moveTo(PAGE.margin, 773)
        .lineTo(PAGE.width - PAGE.margin, 773)
        .lineWidth(0.7)
        .strokeColor(COLORS.border)
        .stroke();

    document
        .font('Helvetica')
        .fontSize(7.5)
        .fillColor(COLORS.muted)
        .text('CYBERHILL  /  INTERNAL MANAGEMENT REPORT', PAGE.margin, 780, {
            width: 350,
            lineBreak: false
        })
        .text(`PAGE ${pageNumber}`, PAGE.width - PAGE.margin - 55, 780, {
            width: 55,
            align: 'right',
            lineBreak: false
        });
    document.restore();
    document.x = currentX;
    document.y = currentY;
};

const drawPageHeader = (document) => {
    const currentX = document.x;
    const currentY = document.y;
    document.save();
    document
        .rect(0, 0, PAGE.width, 7)
        .fill(COLORS.cyan);
    document
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor(COLORS.navy)
        .text('CYBERHILL  /  SECURITY & RISK INTELLIGENCE', PAGE.margin, 24, {
            lineBreak: false
        });
    document.restore();
    document.x = currentX;
    document.y = currentY;
};

const addPage = (document) => {
    document.addPage();
    return document.y;
};

const ensureSpace = (document, height) => {
    if (document.y + height > PAGE.bottom) {
        addPage(document);
    }
};

const drawSectionTitle = (document, title, subtitle) => {
    ensureSpace(document, subtitle ? 48 : 34);
    const y = document.y;
    document
        .font('Helvetica-Bold')
        .fontSize(14)
        .fillColor(COLORS.navy)
        .text(title, PAGE.margin, y, { lineBreak: false });

    document
        .moveTo(PAGE.margin, y + 23)
        .lineTo(PAGE.width - PAGE.margin, y + 23)
        .lineWidth(1)
        .strokeColor(COLORS.border)
        .stroke();

    if (subtitle) {
        document
            .font('Helvetica')
            .fontSize(8.5)
            .fillColor(COLORS.muted)
            .text(subtitle, PAGE.margin, y + 29, {
                width: PAGE.contentWidth
            });
        document.y = y + 44;
    } else {
        document.y = y + 31;
    }
};

const metricAccent = (label) => {
    const normalizedLabel = label.toLowerCase();
    if (normalizedLabel.includes('critical')) return COLORS.critical;
    if (normalizedLabel.includes('high')) return COLORS.high;
    if (normalizedLabel.includes('medium')) return COLORS.medium;
    if (normalizedLabel.includes('low')) return COLORS.low;
    if (normalizedLabel.includes('open') || normalizedLabel.includes('overdue')) {
        return COLORS.high;
    }
    return COLORS.blue;
};

const getExecutiveHighlights = (metrics) => {
    const highlights = [];

    const visit = (group, section) => {
        Object.entries(group).forEach(([key, value]) => {
            if (key === 'severity_breakdown' || key === 'risk_level_breakdown') {
                Object.entries(value).forEach(([level, count]) => {
                    if ((level === 'critical' || level === 'high') && Number(count) > 0) {
                        const subject = key === 'risk_level_breakdown'
                            ? 'Risks'
                            : 'Vulnerabilities';
                        highlights.push({
                            label: `${formatLabel(level)} ${subject}`,
                            value: count,
                            color: metricAccent(level)
                        });
                    }
                });
                return;
            }

            if (value && typeof value === 'object' && !Array.isArray(value)) {
                visit(value, key);
                return;
            }

            if (key === 'open_risks' || key === 'overdue') {
                highlights.push({
                    label: formatLabel(key),
                    value,
                    color: metricAccent(key)
                });
            }
        });
    };
    visit(metrics, '');

    if (highlights.length > 0) {
        return highlights.slice(0, 4);
    }

    const fallbackHighlights = [];
    const collectLeaves = (group) => {
        Object.entries(group).forEach(([label, value]) => {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                collectLeaves(value);
            } else {
                fallbackHighlights.push({
                    label: formatLabel(label),
                    value,
                    color: COLORS.blue
                });
            }
        });
    };
    collectLeaves(metrics);

    return fallbackHighlights.slice(0, 4);
};

const drawHighlightCards = (document, highlights) => {
    if (highlights.length === 0) return;

    const gap = 10;
    const cardWidth = (PAGE.contentWidth - gap * (highlights.length - 1)) / highlights.length;
    const cardHeight = 64;
    ensureSpace(document, cardHeight + 14);
    const y = document.y;

    highlights.forEach((highlight, index) => {
        const x = PAGE.margin + index * (cardWidth + gap);
        document
            .roundedRect(x, y, cardWidth, cardHeight, 5)
            .fill(COLORS.subtle);
        document
            .rect(x, y, 3, cardHeight)
            .fill(highlight.color);
        document
            .font('Helvetica-Bold')
            .fontSize(17)
            .fillColor(COLORS.navy)
            .text(formatValue(highlight.value), x + 12, y + 9, {
                width: cardWidth - 20,
                lineBreak: false
            });
        document
            .font('Helvetica')
            .fontSize(7.5)
            .fillColor(COLORS.muted)
            .text(highlight.label.toUpperCase(), x + 12, y + 39, {
                width: cardWidth - 20,
                height: 18
            });
    });

    document.y = y + cardHeight + 14;
};

const drawMetricCards = (document, metrics) => {
    const cards = Object.entries(metrics)
        .filter(([, value]) => value === null || typeof value !== 'object');
    const columns = 2;
    const gap = 10;
    const cardWidth = (PAGE.contentWidth - gap) / columns;
    const cardHeight = 55;

    for (let index = 0; index < cards.length; index += columns) {
        ensureSpace(document, cardHeight + 8);
        const y = document.y;
        const row = cards.slice(index, index + columns);

        row.forEach(([label, value], column) => {
            const x = PAGE.margin + column * (cardWidth + gap);
            const color = metricAccent(label);

            document
                .roundedRect(x, y, cardWidth, cardHeight, 4)
                .fill(COLORS.subtle);
            document
                .rect(x, y, 3, cardHeight)
                .fill(color);
            document
                .font('Helvetica')
                .fontSize(8.5)
                .fillColor(COLORS.muted)
                .text(formatLabel(label), x + 12, y + 9, {
                    width: cardWidth - 22
                });
            document
                .font('Helvetica-Bold')
                .fontSize(16)
                .fillColor(COLORS.ink)
                .text(formatValue(value), x + 12, y + 27, {
                    width: cardWidth - 22,
                    lineBreak: false
                });
        });

        document.y = y + cardHeight + 8;
    }
};

const drawBreakdown = (document, label, values) => {
    const entries = Object.entries(values);
    if (entries.length === 0) return;

    ensureSpace(document, 42 + entries.length * 23);
    document
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(COLORS.ink)
        .text(formatLabel(label), PAGE.margin, document.y, {
            width: PAGE.contentWidth
        });
    document.moveDown(0.35);

    const maxCount = Math.max(...entries.map(([, count]) => Number(count)), 1);
    const labelWidth = 92;
    const countWidth = 34;
    const barX = PAGE.margin + labelWidth;
    const barWidth = PAGE.contentWidth - labelWidth - countWidth - 8;

    entries.forEach(([level, count]) => {
        ensureSpace(document, 24);
        const y = document.y;
        const color = SEVERITY_COLORS[level.toLowerCase()] || COLORS.neutral;
        const currentBarWidth = Math.max(
            Number(count) > 0 ? 2 : 0,
            (barWidth * Number(count)) / maxCount
        );

        document
            .font('Helvetica')
            .fontSize(8.5)
            .fillColor(COLORS.muted)
            .text(formatLabel(level), PAGE.margin, y + 1, {
                width: labelWidth - 8,
                lineBreak: false
            });
        document
            .roundedRect(barX, y + 2, barWidth, 8, 4)
            .fill(COLORS.border);
        if (currentBarWidth > 0) {
            document
                .roundedRect(barX, y + 2, currentBarWidth, 8, 4)
                .fill(color);
        }
        document
            .font('Helvetica-Bold')
            .fontSize(8.5)
            .fillColor(COLORS.ink)
            .text(formatValue(count), PAGE.width - PAGE.margin - countWidth, y, {
                width: countWidth,
                align: 'right',
                lineBreak: false
            });
        document.y = y + 20;
    });

    document.y += 6;
};

const drawMetricSection = (document, label, metrics, depth = 0) => {
    const scalarMetrics = {};
    const nestedMetrics = {};

    Object.entries(metrics).forEach(([key, value]) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            nestedMetrics[key] = value;
        } else {
            scalarMetrics[key] = value;
        }
    });

    if (depth === 0 && label) {
        drawSectionTitle(document, formatLabel(label));
    } else if (
        depth > 0 &&
        label !== 'severity_breakdown' &&
        label !== 'risk_level_breakdown' &&
        label !== 'status_breakdown'
    ) {
        ensureSpace(document, 28);
        document
            .font('Helvetica-Bold')
            .fontSize(10)
            .fillColor(COLORS.ink)
            .text(formatLabel(label), PAGE.margin, document.y, {
                width: PAGE.contentWidth
            });
        document.moveDown(0.4);
    }

    if (Object.keys(scalarMetrics).length > 0) {
        drawMetricCards(document, scalarMetrics);
    }

    Object.entries(nestedMetrics).forEach(([nestedLabel, value]) => {
        if (
            nestedLabel === 'severity_breakdown' ||
            nestedLabel === 'risk_level_breakdown' ||
            nestedLabel === 'status_breakdown'
        ) {
            drawBreakdown(document, nestedLabel, value);
        } else {
            drawMetricSection(document, nestedLabel, value, depth + 1);
        }
    });
};

const drawDomainBanner = (document, title, subtitle, sectionNumber) => {
    ensureSpace(document, 86);
    const y = document.y;
    const bannerHeight = subtitle ? 76 : 60;

    document
        .roundedRect(PAGE.margin, y, PAGE.contentWidth, bannerHeight, 6)
        .fill(COLORS.navy);
    document
        .rect(PAGE.margin, y, 5, bannerHeight)
        .fill(COLORS.cyan);

    if (sectionNumber) {
        document
            .font('Helvetica-Bold')
            .fontSize(8)
            .fillColor('#8DDCE4')
            .text(`SECTION ${String(sectionNumber).padStart(2, '0')}`, PAGE.margin + 18, y + 13, {
                lineBreak: false
            });
    } else {
        document
            .font('Helvetica-Bold')
            .fontSize(8)
            .fillColor('#8DDCE4')
            .text('SECURITY DOMAIN', PAGE.margin + 18, y + 12, {
                lineBreak: false
            });
    }

    document
        .font('Helvetica-Bold')
        .fontSize(19)
        .fillColor(COLORS.white)
        .text(title, PAGE.margin + 18, y + (sectionNumber ? 27 : 25), {
            width: PAGE.contentWidth - 36,
            lineBreak: false
        });

    if (subtitle) {
        document
            .font('Helvetica')
            .fontSize(8.5)
            .fillColor('#D6E2EE')
            .text(subtitle, PAGE.margin + 18, y + 53, {
                width: PAGE.contentWidth - 36,
                height: 18
            });
    }

    document.y = y + bannerHeight + 18;
};

const getSubtitleTagRows = (document, subtitle, width) => {
    if (!subtitle) return [];

    const tags = subtitle.split('/').map((tag) => tag.trim()).filter(Boolean);
    const rows = [];
    let currentRow = [];
    let currentWidth = 0;

    tags.forEach((tag) => {
        document.font('Helvetica-Bold').fontSize(6.5);
        const tagWidth = document.widthOfString(tag) + 12;
        const nextWidth = currentRow.length ? currentWidth + 5 + tagWidth : tagWidth;

        if (currentRow.length && nextWidth > width) {
            rows.push(currentRow);
            currentRow = [];
            currentWidth = 0;
        }

        currentRow.push({ text: tag, width: tagWidth });
        currentWidth += (currentRow.length > 1 ? 5 : 0) + tagWidth;
    });

    if (currentRow.length) rows.push(currentRow);
    return rows;
};

const drawRecordDetails = (document, details) => {
    if (!details) return;

    ensureSpace(document, 45);
    document
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor(COLORS.navy)
        .text(details.heading || 'Key records', PAGE.margin, document.y, {
            width: PAGE.contentWidth
        });
    document.moveDown(0.35);

    if (details.intro) {
        const introHeight = document.heightOfString(details.intro, {
            width: PAGE.contentWidth,
            font: 'Helvetica',
            fontSize: 8.5
        });
        ensureSpace(document, introHeight + 8);
        document
            .font('Helvetica')
            .fontSize(8.5)
            .fillColor(COLORS.muted)
            .text(details.intro, PAGE.margin, document.y, {
                width: PAGE.contentWidth
            });
        document.y += introHeight + 9;
    }

    if (!Array.isArray(details.items) || details.items.length === 0) {
        const emptyMessage = details.empty_message || 'No additional records are available.';
        ensureSpace(document, 34);
        const y = document.y;
        document
            .roundedRect(PAGE.margin, y, PAGE.contentWidth, 30, 4)
            .fill(COLORS.subtle);
        document
            .font('Helvetica')
            .fontSize(8.5)
            .fillColor(COLORS.muted)
            .text(emptyMessage, PAGE.margin + 12, y + 10, {
                width: PAGE.contentWidth - 24
            });
        document.y = y + 38;
        return;
    }

    details.items.forEach((item) => {
        const cardX = PAGE.margin;
        const cardPadding = 13;
        const cardInnerWidth = PAGE.contentWidth - (cardPadding * 2);
        const metadataEntries = Object.entries(item.metadata || {})
            .filter(([, value]) => value !== null && value !== undefined && value !== '')
            .map(([key, value]) => ({
                label: formatLabel(key),
                value: formatMetadataValue(key, value)
            }));
        const hasMetadata = metadataEntries.length > 0;
        const metadataPanelWidth = hasMetadata ? 194 : 0;
        const columnGap = hasMetadata ? 13 : 0;
        const textColumnWidth = cardInnerWidth - metadataPanelWidth - columnGap;
        const textX = cardX + cardPadding;
        const metadataX = textX + textColumnWidth + columnGap;
        const title = item.title || 'Untitled record';
        const titleHeight = document.heightOfString(title, {
            width: textColumnWidth,
            font: 'Helvetica-Bold',
            fontSize: 9
        });
        const subtitleRows = getSubtitleTagRows(document, item.subtitle, textColumnWidth);
        const subtitleHeight = subtitleRows.reduce((height, row) => (
            height + (row.length ? 15 : 0)
        ), 0);
        const descriptionHeight = item.description
            ? document.heightOfString(item.description, {
                width: textColumnWidth,
                font: 'Helvetica',
                fontSize: 8
            })
            : 0;
        const metadataColumns = metadataEntries.length === 1 ? 1 : 2;
        const metadataColumnGap = 6;
        const metadataCellWidth = (
            metadataPanelWidth - ((metadataColumns - 1) * metadataColumnGap)
        ) / metadataColumns;
        const metadataRows = [];

        for (let index = 0; index < metadataEntries.length; index += metadataColumns) {
            const fields = metadataEntries.slice(index, index + metadataColumns).map((entry) => ({
                ...entry,
                labelHeight: document.heightOfString(entry.label.toUpperCase(), {
                    width: metadataCellWidth - 10,
                    font: 'Helvetica-Bold',
                    fontSize: 5.5
                }),
                valueHeight: document.heightOfString(entry.value, {
                    width: metadataCellWidth - 10,
                    font: 'Helvetica-Bold',
                    fontSize: 6.5
                })
            }));
            metadataRows.push({
                fields,
                height: Math.max(
                    24,
                    ...fields.map(({ labelHeight, valueHeight }) => (
                        labelHeight + valueHeight + 10
                    ))
                )
            });
        }

        const metadataHeight = hasMetadata
            ? 13 + metadataRows.reduce((height, row) => height + row.height + 4, 0)
            : 0;
        const textHeight = 9 + titleHeight + (subtitleHeight ? subtitleHeight + 2 : 0) +
            (descriptionHeight ? descriptionHeight + 2 : 0);
        const cardHeight = Math.max(textHeight, metadataHeight) + 18;

        ensureSpace(document, cardHeight + 8);
        const y = document.y;
        document
            .roundedRect(cardX, y, PAGE.contentWidth, cardHeight, 4)
            .fill(COLORS.subtle);
        document
            .rect(cardX, y, 3, cardHeight)
            .fill(metricAccent(item.subtitle || title));

        let textY = y + 9;
        document
            .font('Helvetica-Bold')
            .fontSize(9)
            .fillColor(COLORS.ink)
            .text(title, textX, textY, {
                width: textColumnWidth
            });
        textY += titleHeight + 3;

        subtitleRows.forEach((row) => {
            let tagX = textX;
            row.forEach(({ text, width }) => {
                const color = metricAccent(text);
                document
                    .roundedRect(tagX, textY, width, 11, 3)
                    .fill(COLORS.white);
                document
                    .font('Helvetica-Bold')
                    .fontSize(6.5)
                    .fillColor(color)
                    .text(text, tagX + 6, textY + 2, {
                        lineBreak: false
                    });
                tagX += width + 5;
            });
            textY += 15;
        });

        if (item.description) {
            document
                .font('Helvetica')
                .fontSize(8)
                .fillColor(COLORS.muted)
                .text(item.description, textX, textY, {
                    width: textColumnWidth
                });
        }

        if (hasMetadata) {
            let metadataY = y + 9;
            document
                .font('Helvetica-Bold')
                .fontSize(5.5)
                .fillColor(COLORS.muted)
                .text('RECORDED DETAILS', metadataX, metadataY, {
                    lineBreak: false
                });
            metadataY += 10;

            metadataRows.forEach((row) => {
                row.fields.forEach((field, columnIndex) => {
                    const cellX = metadataX +
                        columnIndex * (metadataCellWidth + metadataColumnGap);
                    document
                        .roundedRect(cellX, metadataY, metadataCellWidth, row.height, 3)
                        .fill(COLORS.white);
                    document
                        .font('Helvetica-Bold')
                        .fontSize(5.5)
                        .fillColor(COLORS.muted)
                        .text(field.label.toUpperCase(), cellX + 5, metadataY + 4, {
                            width: metadataCellWidth - 10
                        });
                    document
                        .font('Helvetica-Bold')
                        .fontSize(6.5)
                        .fillColor(COLORS.ink)
                        .text(field.value, cellX + 5, metadataY + 4 + field.labelHeight + 2, {
                            width: metadataCellWidth - 10
                        });
                });
                metadataY += row.height + 4;
            });
        }

        document.y = y + cardHeight + 7;
    });
};

const drawNarrative = (document, narrative) => {
    if (!narrative) return;

    const textHeight = document.heightOfString(narrative, {
        width: PAGE.contentWidth - 28,
        font: 'Helvetica',
        fontSize: 9.5
    });
    ensureSpace(document, textHeight + 24);
    const y = document.y;

    document
        .roundedRect(PAGE.margin, y, PAGE.contentWidth, textHeight + 20, 4)
        .fill('#EEF6FC');
    document
        .rect(PAGE.margin, y, 3, textHeight + 20)
        .fill(COLORS.blue);
    document
        .font('Helvetica')
        .fontSize(9.5)
        .fillColor(COLORS.ink)
        .text(narrative, PAGE.margin + 14, y + 10, {
            width: PAGE.contentWidth - 28
        });
    document.y = y + textHeight + 30;
};

const drawLimitations = (document, limitations) => {
    if (!Array.isArray(limitations) || limitations.length === 0) return;

    const firstLimitationHeight = document.heightOfString(limitations[0], {
        width: PAGE.contentWidth - 22,
        font: 'Helvetica',
        fontSize: 8.5
    });
    ensureSpace(document, 54 + firstLimitationHeight + 10);
    drawSectionTitle(
        document,
        'Data notes & limitations',
        'Interpret these results in light of the available source data.'
    );

    limitations.forEach((limitation) => {
        const textHeight = document.heightOfString(limitation, {
            width: PAGE.contentWidth - 22,
            font: 'Helvetica',
            fontSize: 8.5
        });
        ensureSpace(document, textHeight + 9);
        const y = document.y;

        document
            .circle(PAGE.margin + 4, y + 5, 2)
            .fill(COLORS.cyan);
        document
            .font('Helvetica')
            .fontSize(8.5)
            .fillColor(COLORS.muted)
            .text(limitation, PAGE.margin + 14, y, {
                width: PAGE.contentWidth - 18
            });
        document.y += textHeight + 7;
    });
};

const drawCoverHeader = (document, report) => {
    document
        .rect(0, 0, PAGE.width, 142)
        .fill(COLORS.navy);
    document
        .rect(0, 136, PAGE.width, 6)
        .fill(COLORS.cyan);

    document
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#9CC6E7')
        .text('CYBERHILL  /  SECURITY & RISK INTELLIGENCE', PAGE.margin, 30, {
            lineBreak: false
        });
    document
        .font('Helvetica-Bold')
        .fontSize(23)
        .fillColor(COLORS.white)
        .text(formatLabel(report.metadata.report_type), PAGE.margin, 52, {
            width: PAGE.contentWidth,
            height: 58
        });
    document
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#D6E2EE')
        .text('MANAGEMENT REPORT', PAGE.margin, 110, {
            lineBreak: false
        });

    document
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor(COLORS.navy)
        .text('REPORTING PERIOD', PAGE.margin, 156, {
            lineBreak: false
        });
    document
        .font('Helvetica')
        .fontSize(9)
        .fillColor(COLORS.ink)
        .text(`${report.metadata.period_start}  —  ${report.metadata.period_end}`, PAGE.margin, 170, {
            lineBreak: false
        });
    document
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor(COLORS.navy)
        .text('GENERATED', PAGE.margin + 275, 156, {
            lineBreak: false
        });
    document
        .font('Helvetica')
        .fontSize(9)
        .fillColor(COLORS.ink)
        .text(report.metadata.generated_at, PAGE.margin + 275, 170, {
            width: 225,
            lineBreak: false
        });
    document
        .font('Helvetica')
        .fontSize(7.5)
        .fillColor(COLORS.muted)
        .text(`Reporting basis: ${formatLabel(report.metadata.reporting_mode)}`, PAGE.margin, 190, {
            width: PAGE.contentWidth
        });

    document.y = 213;
};

const generateReportPdf = (report) => {
    if (!report || typeof report !== 'object' || !report.metadata) {
        return Promise.reject(new Error('A valid report data object is required to generate a PDF.'));
    }

    return new Promise((resolve, reject) => {
        const document = new PDFDocument({
            size: 'A4',
            margins: {
                top: PAGE.margin,
                bottom: PAGE.margin,
                left: PAGE.margin,
                right: PAGE.margin
            },
            info: {
                Title: `${formatLabel(report.metadata.report_type)} Management Report`,
                Subject: report.summary || 'CyberHill security report',
                Creator: 'CyberHill'
            }
        });
        const chunks = [];
        let pageNumber = 1;

        document.on('data', (chunk) => chunks.push(chunk));
        document.on('error', reject);
        document.on('pageAdded', () => {
            pageNumber += 1;
            drawPageHeader(document);
            drawPageFooter(document, pageNumber);
        });
        document.on('end', () => resolve(Buffer.concat(chunks)));

        drawCoverHeader(document, report);
        drawPageFooter(document, pageNumber);

        const summary = report.summary || 'No summary provided.';
        document
            .font('Helvetica-Bold')
            .fontSize(14)
            .fillColor(COLORS.navy)
            .text('Executive summary', PAGE.margin, document.y, {
                width: PAGE.contentWidth
            });
        document.moveDown(0.35);
        document
            .font('Helvetica')
            .fontSize(9.5)
            .fillColor(COLORS.ink)
            .text(summary, PAGE.margin, document.y, {
                width: PAGE.contentWidth
            });
        document.moveDown(0.9);

        const metrics = report.metrics || {};
        drawHighlightCards(document, getExecutiveHighlights(metrics));

        if (report.metadata.report_type === 'management_summary') {
            const sections = Object.entries(metrics);
            sections.forEach(([label, sectionMetrics], index) => {
                addPage(document);
                const title = SECTION_TITLES[label] || formatLabel(label);
                const details = report.details && report.details[label];
                const narrative = report.section_narratives && report.section_narratives[label];

                drawDomainBanner(
                    document,
                    title,
                    details && details.intro,
                    index + 1
                );
                drawMetricSection(document, '', sectionMetrics);
                drawRecordDetails(
                    document,
                    details ? { ...details, intro: '' } : details
                );
                drawNarrative(document, narrative);
            });
        } else {
            drawDomainBanner(
                document,
                SECTION_TITLES[report.metadata.report_type] ||
                    formatLabel(report.metadata.report_type),
                'Current position and activity recorded for the reporting period.'
            );
            drawMetricSection(document, '', metrics);
            drawRecordDetails(document, report.details);
            drawNarrative(document, report.narrative);
        }

        drawLimitations(document, report.limitations);

        document.end();
    });
};

module.exports = {
    generateReportPdf
};
