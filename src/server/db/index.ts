import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";

import Database from "better-sqlite3";
import * as sqliteSchema from "./schema-sqlite";

// "Connect" to SQLite database (which is basically a local file named `sqlite.db`)
const sqlite = new Database("sqlite.db");

// This is Drizzle's typesafe API (typesafety is provided by `schema`)
export const db = drizzleSqlite(sqlite, { schema: sqliteSchema, logger: true });

/* If you want to use MySQL:

    // Need this to connect to the MySQL database
    const connection = await mysql.createConnection({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    });

    export const db = drizzle(connection, { schema, mode: "default" });
*/
