import puppeteerExtra from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";

type DataFromDom = Array<{
    id: string;
    name: string;
}>;

export async function scrap(language: "en" | "bn") {
    puppeteerExtra.use(stealthPlugin());
    const browser = await puppeteerExtra.launch({headless: true});
    const page = await browser.newPage();
    await page.setViewport({width: 1080, height: 1024});

    const baseUrl = "https://www.bangladesh.gov.bd/site/view/union-list";
    const query = `${baseUrl}?lang=${language}`;

    try {
        await page.goto(query, {waitUntil: ["domcontentloaded", "networkidle0"]});
    } catch (error) {
        console.log("Error going to page");
    }

    await page.waitForSelector("#div-list");

    const data: DataFromDom = await page.evaluate(() => {
        const storage: DataFromDom = [];

        $('#div-list option:not(:contains("Select"))').each(function () {
            const rawId = $(this).val();
            if (rawId) {
                storage.push({
                    id: rawId.toString(),
                    name: $(this).text(),
                });
            }
        });
        return storage;
    });

    await browser.close();
    console.log("Browser work complete");
    return data;
}
