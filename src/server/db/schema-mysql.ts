import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// User table
export const users = mysqlTable("user", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  email: varchar("email", { length: 150 }).unique().notNull(),
  username: varchar("username", { length: 100 }).unique().notNull(),
  fullName: varchar("fullname", { length: 100 }),
  password: varchar("password", { length: 100 }).notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

  // Actually, this is a derived state -- whether a user is verified can be checked by querying the `pending_email_verification` table.
  // However, it feels convenient to add the state to the `user` table also.
  isVerified: boolean("is_verified").default(false),
});

// A table containing (user ID, email verification code) pairs.
// I thought creating a separate table for this purpose is proper.
export const pendingEmailVerifications = mysqlTable(
  "pending_email_verification",
  {
    userId: bigint("user_id", { mode: "number" })
      .references(() => users.id, { onDelete: "cascade" })
      .primaryKey(),
    verificationCode: varchar("verification_code", { length: 100 })
      .unique()
      .notNull(),
  },
);

// The table that stores auth tokens.
export const sessions = mysqlTable("session", {
  userId: bigint("user_id", { mode: "number" })
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
});

// Relations of `users`
export const usersRelations = relations(users, ({ one }) => ({
  pendingEmailVerification: one(pendingEmailVerifications), // One-to-one relation with `pending_email_verifications`
  session: one(sessions), // One-to-one relation with `sessions`
}));

// Relations of `pending_email_verifications`
export const pendingEmailVerificationsRelations = relations(
  pendingEmailVerifications,
  ({ one }) => ({
    user: one(users, {
      fields: [pendingEmailVerifications.userId],
      references: [users.id],
    }), // One-to-one relation with `users`
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }), // One-to-one relation with `users`
}));
