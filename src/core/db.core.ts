import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDBURL } from "../configs/env.configs";
import * as schema from "./models.core";

// 1. Internal variable to hold the real connection once it's ready
let _internalDb: any = null;

const initializeDb = () => {
  if (_internalDb) return _internalDb;

  const url = getDBURL();
  if (!url) {
    // This will only throw if a request happens and the URL is still empty
    throw new Error("Database URL is missing. Ensure Cloudflare Secrets are set.");
  }

  const client = postgres(url, {
    prepare: false, // Mandatory for Supabase
    ssl: 'require',
    max: 1,         // Best for Cloudflare Workers
    onnotice: () => { }
  });

  _internalDb = drizzle(client, { schema });
  return _internalDb;
};

// 2. THE PROXY: This is the "db" you use everywhere.
// It stays empty until the very microsecond your code tries to use it.
export const db = new Proxy({} as any, {
  get(_, prop) {
    const realDb = initializeDb();
    return realDb[prop];
  },
  apply(target, thisArg, argumentsList) {
    const realDb = initializeDb();
    return Reflect.apply(realDb, thisArg, argumentsList);
  }
});