import { subDistFetch } from "./fetch-sub-dist-data";
import { distAndsubDistDataFetcher } from "./shared";

export async function distFetch(data: Array<{ id: string; name: string }>, language: "en" | "bn") {
  const storage: Array<{
    districtName: string;
    distData: Array<{
      subDistrictName: string;
      subDistdata: Array<string>;
    }>;
  }> = [];

  for (const elem of data) {
    const innerData = await distAndsubDistDataFetcher(elem.id, language, "Upazilla");
    if (innerData) {
      storage.push({
        districtName: elem.name,
        distData: (await subDistFetch(innerData, language)) ?? []
      });
    }
  }

  return storage;
}
