import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./drizzle/schema";

type FinalData = Array<{
  divisionName: string;
  divData: Array<{
    districtName: string;
    distData: Array<{
      subDistrictName: string;
      subDistdata: Array<string>;
    }>;
  }>;
}>;

const sqlite = new Database("data.db");
const db = drizzle(sqlite);

export async function insertEnData(dataForInert: FinalData) {
  for (const div of dataForInert) {
    const [insertedDivData] = await db
      .insert(schema.division_data_en)
      .values({ name: div.divisionName })
      .onConflictDoNothing()
      .returning();

    for (const dist of div.divData) {
      const [insertedDistData] = await db
        .insert(schema.district_data_en)
        .values({ name: dist.districtName, div_en_id: insertedDivData.id })
        .onConflictDoNothing()
        .returning();

      for (const subDist of dist.distData) {
        const [insertedSubDistData] = await db
          .insert(schema.sub_district_data_en)
          .values({
            name: subDist.subDistrictName,
            div_en_id: insertedDivData.id,
            dist_en_id: insertedDistData.id
          })
          .onConflictDoNothing()
          .returning();

        for (const unionName of subDist.subDistdata) {
          await db
            .insert(schema.union_data_en)
            .values({
              name: unionName,
              div_en_id: insertedDivData.id,
              dist_en_id: insertedDistData.id,
              sub_dist_en_id: insertedSubDistData.id
            })
            .onConflictDoNothing();
        }
      }
    }
  }
}

export async function insertBnData(dataForInert: FinalData) {
  for (const div of dataForInert) {
    const [insertedDivData] = await db
      .insert(schema.division_data_bn)
      .values({ name: div.divisionName })
      .onConflictDoNothing()
      .returning();

    for (const dist of div.divData) {
      const [insertedDistData] = await db
        .insert(schema.district_data_bn)
        .values({ name: dist.districtName, div_bn_id: insertedDivData.id })
        .onConflictDoNothing()
        .returning();

      for (const subDist of dist.distData) {
        const [insertedSubDistData] = await db
          .insert(schema.sub_district_data_bn)
          .values({
            name: subDist.subDistrictName,
            div_bn_id: insertedDivData.id,
            dist_bn_id: insertedDistData.id
          })
          .onConflictDoNothing()
          .returning();

        for (const unionName of subDist.subDistdata) {
          await db
            .insert(schema.union_data_bn)
            .values({
              name: unionName,
              div_bn_id: insertedDivData.id,
              dist_bn_id: insertedDistData.id,
              sub_dist_bn_id: insertedSubDistData.id
            })
            .onConflictDoNothing();
        }
      }
    }
  }
}
