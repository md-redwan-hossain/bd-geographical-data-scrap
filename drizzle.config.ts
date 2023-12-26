import type { Config } from "drizzle-kit";

export default {
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  driver: "better-sqlite",
  strict: true,
  verbose: true,
  dbCredentials: {
    url: "./medex.db"
  },
  introspect: {
    casing: "preserve"
  }
} satisfies Config;
