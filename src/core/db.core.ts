import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDBURL } from "../configs/env.configs";
import * as schema from "./models.core";

export const client = postgres(getDBURL(), {
    prepare: false,
    max: 15,
    idle_timeout: 30,
    connect_timeout: 20,
    onnotice: () => { }
});

// 2. Initialize Drizzle with your schema
export const db = drizzle(client, { schema });



// import { drizzle } from "drizzle-orm/postgres-js";
// import postgres from "postgres";
// import { getDBURL } from "../configs/env.configs";
// import * as schema from "./models.core";

// // Internal state to hold the real initialized Drizzle instance
// let _dbInstance: any = null;

// const initDb = () => {
//   const url = getDBURL();
//   if (!url) {
//     throw new Error("Database connection failed: DB_HOST or DB_USER is missing. Ensure setGlobalEnv(env) was called in the fetch handler.");
//   }

//   const client = postgres(url, {
//     prepare: false,
//     max: 1, // Keep this at 1 for Cloudflare Workers to prevent connection exhaustion
//     idle_timeout: 30,
//     connect_timeout: 20,
//   });

//   return drizzle(client, { schema });
// };


// export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
//   get(target, prop, receiver) {
//     // If the instance hasn't been created yet, create it now
//     if (!_dbInstance) {
//       _dbInstance = initDb();
//     }
    
//     // Forward the call to the real Drizzle instance
//     const value = Reflect.get(_dbInstance, prop, receiver);
//     return typeof value === 'function' ? value.bind(_dbInstance) : value;
//   }
// });