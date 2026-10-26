const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    ImageRun,
    HeadingLevel,
    BorderStyle,
    ShadingType
} = require('docx');
const { buildSections, reportTitle } = require('./report-sections-service');

const IMAGE_WIDTH = 600;
const NAVY = '0B2545';
const CYAN = '17B3C9';
const MUTED = '5B6B7B';

const image = (source, maxHeight) => {
    let width = IMAGE_WIDTH;
    let height = Math.round((source.height / source.width) * width);
    if (maxHeight && height > maxHeight) {
        height = maxHeight;
        width = Math.round((source.width / source.height) * height);
    }
    return new Paragraph({
        spacing: { before: 120, after: 240 },
        children: [new ImageRun({
            type: 'png',
            data: source.data,
            transformation: { width, height },
            altText: { title: 'Chart', description: 'Report chart', name: 'chart' }
        })]
    });
};

const sectionHeading = (title, number) => new Paragraph({
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: true,
    spacing: { after: 280 },
    shading: { type: ShadingType.CLEAR, fill: NAVY, color: 'auto' },
    border: { bottom: { style: BorderStyle.SINGLE, size: 24, color: CYAN, space: 4 } },
    children: [new TextRun({ text: ` ${number}.  ${title}`, bold: true, color: 'FFFFFF', size: 36 })]
});

const records = (details) => {
    if (!details) return [];
    const blocks = [new Paragraph({
        spacing: { before: 200, after: 80 },
        children: [new TextRun({ text: details.heading, bold: true, size: 28, color: NAVY })]
    })];
    if (details.intro) {
        blocks.push(new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: details.intro, italics: true, color: MUTED, size: 18 })] }));
    }
    if (details.items.length === 0) {
        blocks.push(new Paragraph({ children: [new TextRun({ text: details.emptyMessage, color: MUTED })] }));
        return blocks;
    }
    details.items.forEach((item) => {
        const accent = { left: { style: BorderStyle.SINGLE, size: 18, color: '2F8FD8', space: 8 } };
        blocks.push(new Paragraph({
            keepNext: true,
            border: accent,
            shading: { type: ShadingType.CLEAR, fill: 'F1F6FB', color: 'auto' },
            spacing: { before: 160 },
            children: [new TextRun({ text: item.title || 'Record', bold: true, size: 22, color: NAVY })]
        }));
        if (item.subtitle) {
            blocks.push(new Paragraph({ border: accent, shading: { type: ShadingType.CLEAR, fill: 'F1F6FB', color: 'auto' }, children: [new TextRun({ text: item.subtitle, color: MUTED, size: 18 })] }));
        }
        if (item.description) {
            blocks.push(new Paragraph({ border: accent, shading: { type: ShadingType.CLEAR, fill: 'F1F6FB', color: 'auto' }, children: [new TextRun({ text: item.description, size: 19 })] }));
        }
        if (item.meta.length) {
            blocks.push(new Paragraph({
                border: accent,
                shading: { type: ShadingType.CLEAR, fill: 'F1F6FB', color: 'auto' },
                children: [new TextRun({ text: item.meta.map(([label, value]) => `${label}: ${value}`).join('   |   '), color: MUTED, size: 17 })]
            }));
        }
    });
    return blocks;
};

const sectionBlocks = (section) => section.blocks.flatMap((block) => {
    if (block.type === 'image') return [image(block.image)];
    if (block.type === 'screenshot') return [image(block, 420)];
    if (block.type === 'records') return records(block.details);
    if (block.type === 'text') {
        return block.text.split(/\n+/).map((line) => new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: line, size: 22 })] }));
    }
    if (block.type === 'note') return [new Paragraph({ children: [new TextRun({ text: block.text, italics: true, color: MUTED, size: 17 })] })];
    return [];
});

const generateReportDocx = async (report) => {
    if (!report || typeof report !== 'object' || !report.metadata) {
        throw new Error('A valid report data object is required to generate a Word document.');
    }
    const title = reportTitle(report);
    const sections = await buildSections(report);

    const children = [
        new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: 'CYBERHILL  /  SECURITY & RISK INTELLIGENCE', bold: true, size: 18, color: CYAN })] }),
        new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 160 }, children: [new TextRun({ text: title, bold: true, color: NAVY, size: 56 })] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: `Reporting period: ${report.metadata.period_start} to ${report.metadata.period_end}`, size: 24 })] }),
        new Paragraph({ spacing: { after: 360 }, children: [new TextRun({ text: `Generated ${String(report.metadata.generated_at || '').slice(0, 10)}`, color: MUTED, size: 18 })] })
    ];

    if (report.manual_narrative) {
        children.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: 'Commentary', bold: true, size: 30, color: NAVY })] }));
        report.manual_narrative.split(/\n+/).forEach((line) => {
            children.push(new Paragraph({
                border: { left: { style: BorderStyle.SINGLE, size: 24, color: '2F8FD8', space: 8 } },
                shading: { type: ShadingType.CLEAR, fill: 'EEF6FC', color: 'auto' },
                spacing: { after: 80 },
                children: [new TextRun({ text: line, size: 22 })]
            }));
        });
    }

    if (sections.length) {
        children.push(new Paragraph({ spacing: { before: 360, after: 120 }, children: [new TextRun({ text: 'In this report', bold: true, size: 30, color: NAVY })] }));
        sections.forEach((section, index) => {
            children.push(new Paragraph({ children: [new TextRun({ text: `${index + 1}.  ${section.title}`, size: 22 })] }));
        });
    }

    sections.forEach((section, index) => {
        children.push(sectionHeading(section.title, index + 1));
        children.push(...sectionBlocks(section));
    });

    const document = new Document({
        creator: 'CyberHill',
        title,
        styles: { default: { document: { run: { font: 'Arial' } } } },
        sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } } }, children }]
    });
    return Packer.toBuffer(document);
};

module.exports = { generateReportDocx };
