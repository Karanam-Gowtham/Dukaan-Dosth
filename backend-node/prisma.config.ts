import "dotenv/config";
import { defineConfig } from "prisma/config";

// --- Universal Database Resolution ---
// Prisma 7 requires the datasource URL in this config layer.
// We support all common Vercel/Prisma/Neon naming conventions for zero-config onboarding.
const DATABASE_URL = 
  process.env["POSTGRES_PRISMA_URL"] || 
  process.env["POSTGRES_URL"] || 
  process.env["DATABASE_URL"] || 
  process.env["PRISMA_DATABASE_URL"];

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: DATABASE_URL,
  },
});
