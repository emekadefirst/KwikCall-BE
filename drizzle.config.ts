import { defineConfig } from "drizzle-kit";

// HARDCODE FOR ONE-TIME PUSH
// Replace YOUR_PASSWORD_HERE with: kwikcallDB26@
const DB_URL = `postgresql://postgres.momkjmjdcrohqonwqdtf:kwikcallDB26@@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require`;

export default defineConfig({
  out: "./drizzle",
  schema: "./src/core/models.core.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DB_URL,
  },
  verbose: true,
  strict: true,
});