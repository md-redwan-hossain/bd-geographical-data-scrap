import { distFetch } from "./fetch-dist-data";
import { distAndSubDistDataFetcher } from "./shared";

export async function divFetch(data: Array<{ id: string; name: string }>, language: "en" | "bn") {
  const storage: Array<{
    divisionName: string;
    divData: Array<{
      districtName: string;
      distData: Array<{
        subDistrictName: string;
        subDistData: Array<string>;
      }>;
    }>;
  }> = [];

  for (const elem of data) {
    const innerData = await distAndSubDistDataFetcher(elem.id, language, "District");
    if (innerData) {
      storage.push({
        divisionName: elem.name.trim(),
        divData: (await distFetch(innerData, language)) ?? []
      });
    }
  }

  return storage;
}
