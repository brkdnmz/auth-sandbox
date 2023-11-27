import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "~/env.mjs";

import * as mysqlSchema from "./schema-mysql";

const connection = await mysql.createConnection({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

export const db = drizzle(connection, { schema: mysqlSchema, mode: "default" });

/* If you want to use SQLite:

    // "Connect" to SQLite database (which is basically a local file named `sqlite.db`)
    const sqlite = new Database("sqlite.db");

    // This is Drizzle's typesafe API (typesafety is provided by `schema`)
    export const db = drizzleSqlite(sqlite, { schema: sqliteSchema, logger: true });
*/
