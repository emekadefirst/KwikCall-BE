import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { DBURL } from "../configs/env.configs";
import * as schema from "./models.core";


export const client = postgres(DBURL as string, {
    max: 20,
    idle_timeout: 30,
    connect_timeout: 20,
    onnotice: () => { }
});

export const db = drizzle(client, { schema: schema });
console.log("[DB] Connected to database")