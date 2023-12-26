import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import puppeteerExtra from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import * as schema from "./drizzle/schema";

type DataFromDom = Array<{
  divisionName: string;
  data: Array<{
    districtName: string;
    data: Array<string>;
  }>;
}>;

const sqlite = new Database("data.db");
const db = drizzle(sqlite);

async function scrap(language: "en" | "bn") {
  puppeteerExtra.use(stealthPlugin());
  const browser = await puppeteerExtra.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1024 });

  const baseUrl = "https://www.bangladesh.gov.bd/site/view/upazila-list";
  const query = `${baseUrl}?lang=${language}`;

  try {
    await page.goto(query, { waitUntil: ["domcontentloaded", "networkidle0"] });
  } catch (error) {
    console.log("Error going to page");
  }

  await page.waitForSelector(".div-wise-upz");

  const data: DataFromDom = await page.evaluate(() => {
    const mainStorage: DataFromDom = [];

    $(".div-wise-upz").each(function () {
      const division = $(this).text().trim();
      const geotable = $(this).next(".geotable");

      const innerStorage: Array<{
        districtName: string;
        data: Array<string>;
      }> = [];

      $(geotable)
        .find("tr")
        .each(function () {
          const cell1Content = $(this).find("td").eq(0).text().trim();
          const cell2Content = $(this).find("td").eq(1).text().trim();
          const upazilla = cell2Content
            .split(",")
            .map((x) => x.trim())
            .filter((x) => x);
          if (upazilla.length > 0) {
            innerStorage.push({ districtName: cell1Content, data: upazilla });
          }
        });
      mainStorage.push({
        divisionName: division,
        data: innerStorage
      });
    });
    return mainStorage;
  });

  await browser.close();
  return data;
}

async function insertEnData(dataForInert: DataFromDom) {
  for (const div of dataForInert) {
    const [insertedDivData] = await db
      .insert(schema.division_data_en)
      .values({ name: div.divisionName })
      .onConflictDoNothing()
      .returning();

    for (const dist of div.data) {
      const [insertedDistData] = await db
        .insert(schema.district_data_en)
        .values({ name: dist.districtName, div_en_id: insertedDivData.id })
        .onConflictDoNothing()
        .returning();

      for (const subDistName of dist.data) {
        await db
          .insert(schema.sub_district_data_en)
          .values({
            name: subDistName,
            div_en_id: insertedDivData.id,
            dist_en_id: insertedDistData.id
          })
          .onConflictDoNothing();
      }
    }
  }
}

async function insertBnData(dataForInert: DataFromDom) {
  for (const div of dataForInert) {
    const [insertedDivData] = await db
      .insert(schema.division_data_bn)
      .values({ name: div.divisionName.split(" ")[0] })
      .onConflictDoNothing()
      .returning();

    for (const dist of div.data) {
      const [insertedDistData] = await db
        .insert(schema.district_data_bn)
        .values({ name: dist.districtName, div_bn_id: insertedDivData.id })
        .onConflictDoNothing()
        .returning();

      for (const subDistName of dist.data) {
        await db
          .insert(schema.sub_district_data_bn)
          .values({
            name: subDistName,
            div_bn_id: insertedDivData.id,
            dist_bn_id: insertedDistData.id
          })
          .onConflictDoNothing();
      }
    }
  }
}

async function runLoop() {
  const enData = await scrap("en");
  await insertEnData(enData);

  const bnData = await scrap("bn");
  await insertBnData(bnData);
}

(async () => {
  await runLoop();
  console.log("Done");
  process.exit();
})();
