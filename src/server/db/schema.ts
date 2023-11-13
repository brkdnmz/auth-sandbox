// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  bigint,
  index,
  mysqlTableCreator,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator((name) => `auth-sandbox_${name}`);

export const posts = mysqlTable(
  "post",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    name: varchar("name", { length: 256 }),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  }),
);

// User table
export const users = mysqlTable("user", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 150 }).unique().notNull(),
  username: varchar("username", { length: 100 }).notNull(),
  fullName: varchar("fullname", { length: 100 }).notNull(),
  password: varchar("password", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// A table containing (user ID, email verification code) pairs.
// I thought creating a separate table for this purpose is proper.
export const pendingEmailVerifications = mysqlTable(
  "pending_email_verifications",
  {
    userId: bigint("user_id", { mode: "bigint" }).references(() => users.id),
    verificationCode: varchar("verification_code", { length: 100 })
      .unique()
      .notNull(),
  },
);

// The table that stores auth tokens.
export const sessions = mysqlTable("session", {
  userId: bigint("user_id", { mode: "bigint" }).references(() => users.id),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
});
