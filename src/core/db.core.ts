import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { DBURL } from "../configs/env.configs";
import * as schema from "./models.core";

export const client = postgres(DBURL!, {
    prepare: false,
    max: 15,
    idle_timeout: 30,
    connect_timeout: 20,
    onnotice: () => { }
});

// 2. Initialize Drizzle with your schema
export const db = drizzle(client, { schema });