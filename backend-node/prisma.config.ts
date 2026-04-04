import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 Architecture: Database configuration centralized in prisma.config.ts
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Vercel Postgres Environment Naming
    url: process.env["POSTGRES_PRISMA_URL"] || process.env["DATABASE_URL"],
  },
});
