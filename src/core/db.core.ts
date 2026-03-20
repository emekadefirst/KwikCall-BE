import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { getDBURL } from "../configs/env.configs";
import * as schema from "./models.core";

let _dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

const initDb = () => {
  const url = getDBURL();
  if (!url) {
    throw new Error("Database connection failed: DB URL is empty. Ensure setGlobalEnv(env) was called.");
  }

  const pool = new Pool({
    connectionString: url,
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 20000,
  });

  return drizzle(pool, { schema });
};

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(target, prop, receiver) {
    if (!_dbInstance) {
      _dbInstance = initDb();
    }
    const value = Reflect.get(_dbInstance, prop, receiver);
    return typeof value === "function" ? value.bind(_dbInstance) : value;
  },
});