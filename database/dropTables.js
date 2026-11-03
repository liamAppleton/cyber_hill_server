require("dotenv").config();

const db = require("./db.js");

async function dropTables() {
    try {
        console.log("Disabling foreign key checks...");
        await db.query("SET FOREIGN_KEY_CHECKS = 0");

        const tables = [
            "user_sessions",
            "report_soc",
            "phishing_campaign_results",
            "ticket_monthly_stats",
            "ticket_category_counts",
            "reports",
            "record_relationships",
            "audit_log",
            "status_history",
            "project_notes",
            "projects",
            "vendor_risk_notes",
            "vendor_risks",
            "vendor_notes",
            "vendors",
            "vulnerability_asset_notes",
            "vulnerability_notes",
            "vulnerability_import_findings",
            "vulnerability_imports",
            "vulnerability_assets",
            "vulnerabilities",
            "threat_articles",
            "assets",
            "users"
        ];

        for (const table of tables) {
            console.log(`Dropping ${table}...`);
            await db.query(`DROP TABLE IF EXISTS \`${table}\``);
        }

        console.log("All tables deleted successfully.");
    } catch (error) {
        console.error("Failed to delete tables:");
        console.error(error);
        process.exitCode = 1;
    } finally {
        // Always attempt to restore FK checking before closing.
        try {
            await db.query("SET FOREIGN_KEY_CHECKS = 1");
        } catch (error) {
            console.error("Could not re-enable foreign key checks:", error);
            process.exitCode = 1;
        }

        await db.end();
    }
}

dropTables();