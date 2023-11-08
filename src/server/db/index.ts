import { drizzle } from "drizzle-orm/mysql2";

import mysql from "mysql2/promise";
import { env } from "~/env.mjs";
import * as schema from "./schema";

// Need this to connect to the MySQL database
const connection = await mysql.createConnection({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

// This is Drizzle's typesafe API (typesafety is provided by `schema`)
export const db = drizzle(connection, { schema, mode: "default" });
