import { defineConfig } from "drizzle-kit";
import { DBURL } from "./src/configs/env.configs";


export default defineConfig({
  out: "./drizzle",
  schema: "./src/core/models.core.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DBURL!,

  },
  verbose: true,
  strict: true,
});