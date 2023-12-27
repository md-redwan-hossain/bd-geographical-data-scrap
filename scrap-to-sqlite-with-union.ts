import { divFetch } from "./fetch-div-data";
import { insertBnData, insertEnData } from "./save-to-db";
import { scrap } from "./scrap";

async function dataFetcher(language: "en" | "bn") {
  const divDataFromDom: Array<{ id: string; name: string }> = await scrap(language);
  return await divFetch(divDataFromDom, language);
}

async function runLoop() {
  const enData = await dataFetcher("en");
  console.log("English data fetch done");

  await insertEnData(enData);
  console.log("English data insert done");

  const bnData = await dataFetcher("bn");
  console.log("Bangla data fetch done");

  await insertBnData(bnData);
  console.log("Bangla data insert done");
}

(async () => {
  await runLoop();
  console.log("Done");
})();
