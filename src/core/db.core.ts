import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { getDBURL } from "../configs/env.configs";
import * as schema from "./models.core";

// Create a fresh pool per request instead of sharing one across requests
export const getDb = () => {
  const pool = new Pool({
    connectionString: getDBURL(),
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 20000,
  });

  return drizzle(pool, { schema });
};

// Keep db export as a proxy that creates fresh instance per call
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  }
});