import {divFetch} from "./fetch-div-data";
import {scrap} from "./scrap";
import {writeFileSync} from 'node:fs';

async function dataFetcher(language: "en" | "bn") {
    const divDataFromDom: Array<{ id: string; name: string }> = await scrap(language);
    return await divFetch(divDataFromDom, language);
}

async function runLoop() {
    console.log("English data fetch started");
    const enData = await dataFetcher("en");
    writeFileSync('enData.json', JSON.stringify(enData), 'utf8');
    console.log("English data insert done");

    console.log("Bangla data fetch started");
    const bnData = await dataFetcher("bn");
    writeFileSync('bnData.json', JSON.stringify(bnData), 'utf8');
    console.log("Bangla data insert done");
}

(async () => {
    await runLoop();
    console.log("Done");
})();
