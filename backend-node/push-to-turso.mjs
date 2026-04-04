import { createClient } from '@libsql/client';
import "dotenv/config";

// Force load development env directly if needed
import { readFileSync, existsSync } from 'fs';
import { parse } from 'dotenv';
if (existsSync('.env.development.local')) {
    const raw = readFileSync('.env.development.local');
    const parsed = parse(raw);
    Object.assign(process.env, parsed);
}

async function initializeDatabase() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        console.error("❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in environment.");
        process.exit(1);
    }

    console.log("🚀 Connecting to Turso via Port 443 (Bypassing Port 5432)...");
    
    const client = createClient({ url, authToken });

    const sqlStatements = [
        `CREATE TABLE IF NOT EXISTS "users" (
            "id" INTEGER PRIMARY KEY AUTOINCREMENT,
            "name" TEXT NOT NULL,
            "phone" TEXT NOT NULL UNIQUE,
            "password" TEXT NOT NULL,
            "role" TEXT NOT NULL DEFAULT 'USER',
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "shopName" TEXT NOT NULL,
            "languagePref" TEXT DEFAULT 'en'
        );`,
        `CREATE TABLE IF NOT EXISTS "transactions" (
            "id" TEXT PRIMARY KEY,
            "amount" REAL NOT NULL,
            "description" TEXT NOT NULL,
            "type" TEXT NOT NULL,
            "category" TEXT,
            "customerName" TEXT,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "userId" INTEGER NOT NULL,
            FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
        );`,
        `CREATE TABLE IF NOT EXISTS "daily_summaries" (
            "id" TEXT PRIMARY KEY,
            "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "totalSales" REAL NOT NULL,
            "totalExpenses" REAL NOT NULL,
            "netProfit" REAL NOT NULL,
            "pendingUdhaar" REAL NOT NULL,
            "transactionCount" INTEGER NOT NULL,
            "userId" INTEGER NOT NULL,
            FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
        );`
    ];

    try {
        for (const sql of sqlStatements) {
            await client.execute(sql);
            console.log(`✅ Executed Table Creation...`);
        }
        console.log("🎉 Turso Database perfectly synchronized! You are ready to go!");
    } catch (err) {
        console.error("❌ Failed to create tables:", err);
    }
}

initializeDatabase();
