import axios from "axios";
import axiosRetry from "axios-retry";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { JSDOM } from "jsdom";
import puppeteerExtra from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import * as schema from "./drizzle/schema";

axiosRetry(axios, {
  retryDelay: (retryCount) => {
    return retryCount * 1000;
  }
});

const sqlite = new Database("data.db");
const db = drizzle(sqlite);

type DataFromDom = Array<{
  id: string;
  divisionName: string;
}>;

async function scrap(language: "en" | "bn") {
  puppeteerExtra.use(stealthPlugin());
  const browser = await puppeteerExtra.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1024 });

  const baseUrl = "https://www.bangladesh.gov.bd/site/view/union-list";
  const query = `${baseUrl}?lang=${language}`;

  try {
    await page.goto(query, { waitUntil: ["domcontentloaded", "networkidle0"] });
  } catch (error) {
    console.log("Error going to page");
  }

  await page.waitForSelector("#div-list");

  const data: DataFromDom = await page.evaluate(() => {
    const mainStorage: DataFromDom = [];

    $('#div-list option:not(:contains("Select"))').each(function () {
      const rawId = $(this).val();
      if (rawId) {
        mainStorage.push({
          id: rawId.toString(),
          divisionName: $(this).text()
        });
      }
    });
    return mainStorage;
  });

  await browser.close();
  console.log("Browser work complete");
  return data;
}

async function distAndsubDistDataFetcher(
  id: string,
  language: "en" | "bn",
  domain: "District" | "Upazilla"
) {
  const formData = new FormData();
  formData.append("parent", id.toString());
  formData.append("domain_type", domain);

  try {
    const response = await axios.post(
      `https://www.bangladesh.gov.bd/child.domains.${language == "en" ? "english" : "bangla"}.php`,
      formData,

      { headers: { "Content-Type": "multipart/form-data" } }
    );
    const extractedData: Array<{ id: string; name: string }> = [];
    const htmlContent = response.data;
    const parser = new JSDOM(htmlContent);
    const optionElements = Array.from(
      parser.window.document.querySelectorAll<HTMLSelectElement>('option:not([value=""])')
    );

    optionElements.forEach((option) => {
      const valueNumber = option.value;
      const textContent: string = option.textContent ? option.textContent.trim() : "";
      if (textContent) {
        extractedData.push({ id: valueNumber, name: textContent.split(" ")[0] });
      }
    });

    return extractedData;
  } catch (error) {
    console.log(error?.message);
  }
}

async function unionDataFetcher(id: string, language: "en" | "bn") {
  const formData = new FormData();
  formData.append("parent", id.toString());
  formData.append("domain_type", "Union");

  try {
    const response = await axios.post(
      `https://www.bangladesh.gov.bd/child.domains.${language == "en" ? "english" : "bangla"}.php`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    const extractedData: Array<string> = [];
    const htmlContent = response.data;
    const parser = new JSDOM(htmlContent);
    const optionElements = Array.from(
      parser.window.document.querySelectorAll<HTMLSelectElement>("td")
    );

    optionElements.forEach((option) => {
      const textContent: string = option.textContent ? option.textContent.trim() : "";
      if (textContent) {
        extractedData.push(textContent);
      }
    });

    return extractedData;
  } catch (error) {
    console.log(error);
  }
}

type FinalIterationData = Array<{
  divisionName: string;
  districtName: string;
  subDistrictName: string;
  unionData: Array<string>;
}>;

async function dataFetcher(language: "en" | "bn") {
  const finalIterData: FinalIterationData = [];

  const divDataFromDom: DataFromDom = await scrap(language);

  for (const elem of divDataFromDom) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const divDataResponse = await distAndsubDistDataFetcher(elem.id, language, "District");
    if (divDataResponse) {
      for (const dist of divDataResponse) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        const distDataResponse = await distAndsubDistDataFetcher(dist.id, language, "Upazilla");
        if (distDataResponse) {
          for (const subDist of distDataResponse) {
            await new Promise((resolve) => setTimeout(resolve, 50));
            const unionDataResponse = await unionDataFetcher(subDist.id, language);
            if (unionDataResponse) {
              finalIterData.push({
                divisionName: elem.divisionName,
                districtName: dist.name,
                subDistrictName: subDist.name,
                unionData: unionDataResponse
              });
            }
          }
        }
      }
    }
  }
  return finalIterData;
}

async function insertEnData(dataForInert: FinalIterationData) {
  for (const elem of dataForInert) {
    const [insertedDivData] = await db
      .insert(schema.division_data_en)
      .values({ name: elem.divisionName })
      .onConflictDoNothing()
      .returning();

    const [insertedDistData] = await db
      .insert(schema.district_data_en)
      .values({ name: elem.districtName, div_en_id: insertedDivData.id })
      .onConflictDoNothing()
      .returning();

    const [insertedSubDistData] = await db
      .insert(schema.sub_district_data_en)
      .values({
        name: elem.subDistrictName,
        div_en_id: insertedDivData.id,
        dist_en_id: insertedDistData.id
      })
      .onConflictDoNothing()
      .returning();

    for (const unionName of elem.unionData) {
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

async function insertBnData(dataForInert: FinalIterationData) {
  for (const elem of dataForInert) {
    const [insertedDivData] = await db
      .insert(schema.division_data_bn)
      .values({ name: elem.divisionName })
      .onConflictDoNothing()
      .returning();

    const [insertedDistData] = await db
      .insert(schema.district_data_bn)
      .values({ name: elem.districtName, div_bn_id: insertedDivData.id })
      .onConflictDoNothing()
      .returning();

    const [insertedSubDistData] = await db
      .insert(schema.sub_district_data_bn)
      .values({
        name: elem.subDistrictName,
        div_bn_id: insertedDivData.id,
        dist_bn_id: insertedDistData.id
      })
      .onConflictDoNothing()
      .returning();

    for (const unionName of elem.unionData) {
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

async function runLoop() {
  const enData = await dataFetcher("en");
  for (const elem of enData) {
    for (const e of elem.unionData) {
      console.log(e);
    }
  }
  // console.log("English data fetch done");
  // await insertEnData(enData);
  // console.log("English data insert done");

  // const bnData = await dataFetcher("bn");
  // console.log("Bangla data fetch done");
  // await insertBnData(bnData);
  // console.log("Bangla data insert done");
}

(async () => {
  await runLoop();
  console.log("Done");
})();
