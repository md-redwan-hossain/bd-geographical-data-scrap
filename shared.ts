import axios from "axios";
import axiosRetry from "axios-retry";
import { JSDOM } from "jsdom";

axiosRetry(axios, {
  retryDelay: (retryCount) => {
    return retryCount * 1000;
  }
});

export async function distAndsubDistDataFetcher(
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
    console.log(`${domain} ${language} fetch done`);
    return extractedData;
  } catch (error) {
    console.log(error?.message);
  }
}
