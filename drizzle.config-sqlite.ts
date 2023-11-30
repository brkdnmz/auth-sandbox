import { type Config } from "drizzle-kit";

export default {
  schema: "./src/server/db/schema-sqlite.ts",
  driver: "better-sqlite",
  dbCredentials: {
    url: "./sqlite.db",
  },
  // tablesFilter: ["auth-sandbox_*"],
  verbose: true,
} satisfies Config;
