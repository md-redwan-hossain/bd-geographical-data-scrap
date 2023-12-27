import { distFetch } from "./fetch-dist-data";
import { distAndsubDistDataFetcher } from "./shared";

export async function divFetch(data: Array<{ id: string; name: string }>, language: "en" | "bn") {
  const storage: Array<{
    divisionName: string;
    divData: Array<{
      districtName: string;
      distData: Array<{
        subDistrictName: string;
        subDistdata: Array<string>;
      }>;
    }>;
  }> = [];

  for (const elem of data) {
    const innerData = await distAndsubDistDataFetcher(elem.id, language, "District");
    if (innerData) {
      storage.push({
        divisionName: elem.name,
        divData: (await distFetch(innerData, language)) ?? []
      });
    }
  }

  return storage;
}
