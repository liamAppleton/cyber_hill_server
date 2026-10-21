const fs = require('node:fs/promises');
const path = require('node:path');
const db = require('./db');

const runMigration = async () => {
    try {
        const migrationPath = path.join(__dirname, 'migrations', '001-user-sessions.sql');
        const migrationSql = await fs.readFile(migrationPath, 'utf8');
        await db.query(migrationSql);
        console.log('User sessions migration applied.');
    } catch (error) {
        console.error('Failed to apply user sessions migration:', error);
        process.exitCode = 1;
    } finally {
        await db.end();
    }
};

runMigration();
