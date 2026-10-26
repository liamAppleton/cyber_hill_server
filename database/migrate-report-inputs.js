const fs = require('node:fs/promises');
const path = require('node:path');
const db = require('./db');

const runMigration = async () => {
    try {
        const migrationPath = path.join(__dirname, 'migrations', '003-report-inputs.sql');
        const statements = (await fs.readFile(migrationPath, 'utf8'))
            .split(';')
            .map((statement) => statement.trim())
            .filter(Boolean);
        for (const statement of statements) {
            await db.query(statement);
        }
        console.log('Report inputs migration applied.');
    } catch (error) {
        console.error('Failed to apply report inputs migration:', error);
        process.exitCode = 1;
    } finally {
        await db.end();
    }
};

runMigration();
