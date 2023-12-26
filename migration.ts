import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const betterSqlite = new Database("data.db");
const db = drizzle(betterSqlite);
migrate(db, { migrationsFolder: "drizzle" });
betterSqlite.close();
