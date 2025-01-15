import { subDistFetch } from "./fetch-sub-dist-data";
import { distAndSubDistDataFetcher } from "./shared";

export async function distFetch(data: Array<{ id: string; name: string }>, language: "en" | "bn") {
  const storage: Array<{
    districtName: string;
    distData: Array<{
      subDistrictName: string;
      subDistData: Array<string>;
    }>;
  }> = [];

  for (const elem of data) {
    const innerData = await distAndSubDistDataFetcher(elem.id, language, "Upazilla");
    if (innerData) {
      storage.push({
        districtName: elem.name.trim(),
        distData: (await subDistFetch(innerData, language)) ?? []
      });
    }
  }

  return storage;
}
