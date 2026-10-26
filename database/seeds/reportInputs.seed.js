const fs = require('node:fs/promises');
const path = require('node:path');
const db = require('../db');

const createReportInputTables = async () => {
    const sql = await fs.readFile(path.join(__dirname, '..', 'migrations', '003-report-inputs.sql'), 'utf8');
    for (const statement of sql.split(';').map((part) => part.trim()).filter(Boolean)) {
        await db.query(statement);
    }
};

module.exports = createReportInputTables;
