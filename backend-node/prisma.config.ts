import "dotenv/config";
import { existsSync, readFileSync } from "fs";
import { parse } from "dotenv";
import { defineConfig } from "prisma/config";
import path from "path";

// --- Enterprise Connection Management ---
let envConfig = { ...process.env };

const envFiles = [".env.development.local", ".env.local", ".env"];
for (const file of envFiles) {
  const envPath = path.resolve(process.cwd(), file);
  if (existsSync(envPath)) {
    const raw = readFileSync(envPath);
    const parsed = parse(raw);
    envConfig = { ...envConfig, ...parsed };
  }
}

// Comprehensive Search for a valid PostgreSQL Direct URL
// We explicitly EXCLUDE edge-proxy (db.prisma.io) and Turso (libsql://) links for db push stability.
const possibleUrls = [
  envConfig["STORAGE_POSTGRES_URL_NON_POOLING"],
  envConfig["POSTGRES_URL_NON_POOLING"],
  envConfig["DATABASE_URL_UNPOOLED"],
  envConfig["STORAGE_POSTGRES_PRISMA_URL"],
  envConfig["DATABASE_URL"],
  envConfig["POSTGRES_URL"]
];

// Professional Sanitization: We filter for the correct protocol and strip problematic parameters
const rawUrl = possibleUrls.find(url => 
  url?.startsWith('postgresql://') || 
  (url?.startsWith('postgres://') && !url.includes('db.prisma.io'))
);

const DATABASE_URL = rawUrl?.replace(/channel_binding=require&?/, "");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: DATABASE_URL,
  },
});
