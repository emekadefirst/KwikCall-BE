import { defineConfig } from "drizzle-kit";
import { getDBURL } from "./src/configs/env.configs";


export default defineConfig({
  out: "./drizzle",
  schema: "./src/core/models.core.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: getDBURL(),
  },
  verbose: true,
  strict: true,
});