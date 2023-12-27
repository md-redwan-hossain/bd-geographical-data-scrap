import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const division_data_en = sqliteTable(
  "division_data_en",
  {
    id: integer("id").primaryKey({ autoIncrement: true, onConflict: "replace" }),
    name: text("name").notNull()
  },
  (table) => {
    return { div_en_id: uniqueIndex("div_en_id").on(table.id) };
  }
);

export const district_data_en = sqliteTable(
  "district_data_en",
  {
    id: integer("id").primaryKey({ autoIncrement: true, onConflict: "replace" }),
    name: text("name").notNull(),
    div_en_id: integer("div_en_id")
      .references(() => division_data_en.id)
      .notNull()
  },
  (table) => {
    return { dist_en_id: uniqueIndex("dist_en_id").on(table.id) };
  }
);

export const sub_district_data_en = sqliteTable(
  "sub_district_data_en",
  {
    id: integer("id").primaryKey({ autoIncrement: true, onConflict: "replace" }),
    name: text("name").notNull(),
    div_en_id: integer("div_en_id")
      .references(() => division_data_en.id)
      .notNull(),
    dist_en_id: integer("dist_en_id")
      .references(() => district_data_en.id)
      .notNull()
  },
  (table) => {
    return { sub_dist_en_id: uniqueIndex("sub_dist_en_id").on(table.id) };
  }
);

export const division_data_bn = sqliteTable(
  "division_data_bn",
  {
    id: integer("id").primaryKey({ autoIncrement: true, onConflict: "replace" }),
    name: text("name").notNull()
  },
  (table) => {
    return { div_bn_id: uniqueIndex("div_bn_id").on(table.id) };
  }
);

export const district_data_bn = sqliteTable(
  "district_data_bn",
  {
    id: integer("id").primaryKey({ autoIncrement: true, onConflict: "replace" }),
    name: text("name").notNull(),
    div_bn_id: integer("div_bn_id")
      .references(() => division_data_bn.id)
      .notNull()
  },
  (table) => {
    return { dist_bn_id: uniqueIndex("dist_bn_id").on(table.id) };
  }
);

export const sub_district_data_bn = sqliteTable(
  "sub_district_data_bn",
  {
    id: integer("id").primaryKey({ autoIncrement: true, onConflict: "replace" }),
    name: text("name").notNull(),
    div_bn_id: integer("div_bn_id")
      .references(() => division_data_bn.id)
      .notNull(),
    dist_bn_id: integer("dist_bn_id")
      .references(() => district_data_bn.id)
      .notNull()
  },
  (table) => {
    return { sub_dist_bn_id: uniqueIndex("sub_dist_bn_id").on(table.id) };
  }
);
