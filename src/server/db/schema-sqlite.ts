import { relations, sql } from "drizzle-orm";
import { int, sqliteTableCreator, text } from "drizzle-orm/sqlite-core";

export const sqliteTable = sqliteTableCreator((name) => `auth-sandbox_${name}`);

// User table
export const users = sqliteTable("user", {
  id: int("id").primaryKey({ autoIncrement: true }),
  email: text("email", { length: 150 }).unique().notNull(),
  username: text("username", { length: 100 }).notNull(),
  fullName: text("fullname", { length: 100 }),
  password: text("password", { length: 100 }).notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

  // Actually, this is a derived state -- whether a user is verified can be checked by querying the `pending_email_verification` table.
  // However, it feels convenient to add the state to the `user` table also.
  isVerified: int("is_verified", { mode: "boolean" }).default(false),
});

// A table containing (user ID, email verification code) pairs.
// I thought creating a separate table for this purpose is proper.
export const pendingEmailVerifications = sqliteTable(
  "pending_email_verification",
  {
    userId: int("user_id")
      .references(() => users.id)
      .notNull(),
    verificationCode: text("verification_code", { length: 100 })
      .unique()
      .notNull(),
  },
);

// The table that stores auth tokens.
export const sessions = sqliteTable("session", {
  userId: int("user_id")
    .references(() => users.id)
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
