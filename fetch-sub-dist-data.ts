import axios from "axios";
import axiosRetry from "axios-retry";
import { JSDOM } from "jsdom";

axiosRetry(axios, {
  retryDelay: (retryCount) => {
    return retryCount * 1000;
  }
});

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

    const optionElements = parser.window.document.querySelector<HTMLSelectElement>("td");
    if (!optionElements) return extractedData;

    const textData: string = optionElements.textContent ? optionElements.textContent.trim() : "";
    if (!textData) return extractedData;

    const splitted = textData.split(",");
    if (splitted.length === 0) return extractedData;

    splitted.forEach((x) => {
      if (x) {
        extractedData.push(x.trim());
      }
    });
    return extractedData;
  } catch (error) {
    console.log(error?.response);
  }
}

export async function subDistFetch(
  data: Array<{ id: string; name: string }>,
  language: "en" | "bn"
) {
  const storage: Array<{
    subDistrictName: string;
    subDistData: Array<string>;
  }> = [];

  for (const elem of data) {
    storage.push({
      subDistrictName: elem.name.trim(),
      subDistData: (await unionDataFetcher(elem.id, language)) ?? []
    });
  }

  return storage;
}
