const PDFDocument = require('pdfkit');
const { COLOURS } = require('./report-chart-service');
const { buildSections, reportTitle } = require('./report-sections-service');

const PAGE = { width: 595.28, height: 841.89, margin: 40 };
PAGE.contentWidth = PAGE.width - PAGE.margin * 2;
const BOTTOM = PAGE.height - 60;

const ensureSpace = (document, height) => {
    if (document.y + height > BOTTOM) document.addPage();
};

const sectionBanner = (document, title, number) => {
    const y = document.y;
    document.roundedRect(PAGE.margin, y, PAGE.contentWidth, 46, 6).fill(COLOURS.navy);
    document.rect(PAGE.margin, y + 8, 4, 30).fill(COLOURS.cyan);
    document
        .font('Helvetica-Bold').fontSize(18).fillColor('#FFFFFF')
        .text(title, PAGE.margin + 20, y + 14, { width: PAGE.contentWidth - 80, lineBreak: false });
    document
        .font('Helvetica').fontSize(10).fillColor('#9CC6E7')
        .text(`SECTION ${number}`, PAGE.margin + 20, y + 18, { width: PAGE.contentWidth - 40, align: 'right', lineBreak: false });
    document.y = y + 46 + 20;
};

const drawImage = (document, image, maxHeight) => {
    let width = PAGE.contentWidth;
    let height = (image.height / image.width) * width;
    if (maxHeight && height > maxHeight) {
        height = maxHeight;
        width = (image.width / image.height) * height;
    }
    ensureSpace(document, height + 16);
    document.image(image.data, PAGE.margin, document.y, { width, height });
    document.y += height + 18;
};

const drawText = (document, text, { size = 10.5, colour = COLOURS.ink, font = 'Helvetica', gap = 10 } = {}) => {
    document.font(font).fontSize(size);
    const height = document.heightOfString(text, { width: PAGE.contentWidth });
    ensureSpace(document, Math.min(height, 120) + gap);
    document.fillColor(colour).text(text, PAGE.margin, document.y, { width: PAGE.contentWidth });
    document.y += gap;
};

const drawRecords = (document, details) => {
    if (!details) return;
    ensureSpace(document, 70);
    document.font('Helvetica-Bold').fontSize(13).fillColor(COLOURS.navy)
        .text(details.heading, PAGE.margin, document.y, { width: PAGE.contentWidth });
    document.y += 4;
    if (details.intro) drawText(document, details.intro, { size: 9, colour: COLOURS.muted, gap: 8 });

    if (details.items.length === 0) {
        drawText(document, details.emptyMessage, { size: 10, colour: COLOURS.muted });
        return;
    }

    const innerWidth = PAGE.contentWidth - 32;
    details.items.forEach((item) => {
        const meta = item.meta.map(([label, value]) => `${label}: ${value}`).join('   |   ');
        document.font('Helvetica-Bold').fontSize(11);
        const titleHeight = document.heightOfString(item.title || 'Record', { width: innerWidth });
        document.font('Helvetica').fontSize(9);
        const subtitleHeight = item.subtitle ? document.heightOfString(item.subtitle, { width: innerWidth }) + 3 : 0;
        const description = item.description || '';
        document.font('Helvetica').fontSize(9.5);
        const descriptionHeight = description ? document.heightOfString(description, { width: innerWidth }) + 5 : 0;
        document.font('Helvetica').fontSize(8.5);
        const metaHeight = meta ? document.heightOfString(meta, { width: innerWidth }) + 4 : 0;
        const cardHeight = 20 + titleHeight + subtitleHeight + descriptionHeight + metaHeight;

        ensureSpace(document, cardHeight + 12);
        const y = document.y;
        document.roundedRect(PAGE.margin, y, PAGE.contentWidth, cardHeight, 6).fill(COLOURS.card);
        document.rect(PAGE.margin, y + 6, 3, cardHeight - 12).fill(COLOURS.blue);
        let cursor = y + 10;
        document.font('Helvetica-Bold').fontSize(11).fillColor(COLOURS.navy)
            .text(item.title || 'Record', PAGE.margin + 16, cursor, { width: innerWidth });
        cursor += titleHeight;
        if (item.subtitle) {
            document.font('Helvetica').fontSize(9).fillColor(COLOURS.muted)
                .text(item.subtitle, PAGE.margin + 16, cursor + 1, { width: innerWidth });
            cursor += subtitleHeight;
        }
        if (description) {
            document.font('Helvetica').fontSize(9.5).fillColor(COLOURS.ink)
                .text(description, PAGE.margin + 16, cursor + 2, { width: innerWidth });
            cursor += descriptionHeight;
        }
        if (meta) {
            document.font('Helvetica').fontSize(8.5).fillColor(COLOURS.muted)
                .text(meta, PAGE.margin + 16, cursor + 2, { width: innerWidth });
        }
        document.y = y + cardHeight + 10;
    });
};

const drawCover = (document, report, title, sections) => {
    document.rect(0, 0, PAGE.width, 170).fill(COLOURS.navy);
    document.rect(0, 164, PAGE.width, 6).fill(COLOURS.cyan);
    document.font('Helvetica-Bold').fontSize(9).fillColor('#9CC6E7')
        .text('CYBERHILL  /  SECURITY & RISK INTELLIGENCE', PAGE.margin, 38, { lineBreak: false });
    document.font('Helvetica-Bold').fontSize(27).fillColor('#FFFFFF')
        .text(title, PAGE.margin, 62, { width: PAGE.contentWidth, height: 70 });
    document.font('Helvetica').fontSize(11).fillColor('#D6E2EE')
        .text(`Reporting period: ${report.metadata.period_start} to ${report.metadata.period_end}`, PAGE.margin, 140, { lineBreak: false });

    document.y = 196;
    document.font('Helvetica').fontSize(9).fillColor(COLOURS.muted)
        .text(`Generated ${String(report.metadata.generated_at || '').slice(0, 10)}`, PAGE.margin, document.y);
    document.y += 28;

    if (report.manual_narrative) {
        document.font('Helvetica-Bold').fontSize(15).fillColor(COLOURS.navy)
            .text('Commentary', PAGE.margin, document.y);
        document.y += 8;
        const height = document.font('Helvetica').fontSize(10.5)
            .heightOfString(report.manual_narrative, { width: PAGE.contentWidth - 32 });
        const maxBox = BOTTOM - document.y - 140;
        const boxHeight = Math.min(height + 28, Math.max(maxBox, 120));
        const y = document.y;
        document.roundedRect(PAGE.margin, y, PAGE.contentWidth, boxHeight, 6).fill('#EEF6FC');
        document.rect(PAGE.margin, y, 4, boxHeight).fill(COLOURS.blue);
        document.font('Helvetica').fontSize(10.5).fillColor(COLOURS.ink)
            .text(report.manual_narrative, PAGE.margin + 18, y + 14, {
                width: PAGE.contentWidth - 36,
                height: boxHeight - 24,
                ellipsis: true
            });
        document.y = y + boxHeight + 28;
    }

    if (sections.length) {
        document.font('Helvetica-Bold').fontSize(15).fillColor(COLOURS.navy)
            .text('In this report', PAGE.margin, document.y);
        document.y += 8;
        sections.forEach((section, index) => {
            document.font('Helvetica').fontSize(11).fillColor(COLOURS.ink)
                .text(`${index + 1}.  ${section.title}`, PAGE.margin + 6, document.y);
            document.y += 4;
        });
    }
};

const drawFooters = (document, title) => {
    const range = document.bufferedPageRange();
    for (let index = range.start; index < range.start + range.count; index += 1) {
        document.switchToPage(index);
        document.page.margins.bottom = 0;
        document.font('Helvetica').fontSize(8).fillColor(COLOURS.muted)
            .text(`CyberHill  |  ${title}`, PAGE.margin, PAGE.height - 32, { width: PAGE.contentWidth - 80, lineBreak: false });
        document.text(`Page ${index + 1} of ${range.count}`, PAGE.margin, PAGE.height - 32, {
            width: PAGE.contentWidth,
            align: 'right',
            lineBreak: false
        });
    }
};

const generateReportPdf = async (report) => {
    if (!report || typeof report !== 'object' || !report.metadata) {
        throw new Error('A valid report data object is required to generate a PDF.');
    }
    const title = reportTitle(report);
    const sections = await buildSections(report);

    return new Promise((resolve, reject) => {
        const document = new PDFDocument({
            size: 'A4',
            bufferPages: true,
            margins: { top: PAGE.margin, bottom: PAGE.margin, left: PAGE.margin, right: PAGE.margin },
            info: { Title: title, Creator: 'CyberHill' }
        });
        const chunks = [];
        document.on('data', (chunk) => chunks.push(chunk));
        document.on('error', reject);
        document.on('end', () => resolve(Buffer.concat(chunks)));

        try {
            drawCover(document, report, title, sections);

            sections.forEach((section, index) => {
                document.addPage();
                sectionBanner(document, section.title, index + 1);
                section.blocks.forEach((block) => {
                    if (block.type === 'image') drawImage(document, block.image);
                    else if (block.type === 'screenshot') drawImage(document, block, 440);
                    else if (block.type === 'records') drawRecords(document, block.details);
                    else if (block.type === 'text') drawText(document, block.text);
                    else if (block.type === 'note') drawText(document, block.text, { size: 8.5, colour: COLOURS.muted, font: 'Helvetica-Oblique' });
                });
            });

            drawFooters(document, title);
            document.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateReportPdf };
