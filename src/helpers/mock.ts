import { DatoFields } from "./constants";

export const mockCreateRecord = async(data:Record<string,unknown>):Promise<Record<string,unknown> | null> => {
  if (data && data.itemType) {
    // mocking id for new Record
    const id = Math.floor(Math.random() * 1000 + 1).toString();
    const newRecord : Record<string,unknown> = {
      ...data,
      id,
    };
    return newRecord;
  }
  return null;

};

export const mockUpdateRecord = async (id:string, data:Record<string,unknown>):Promise<Record<string,unknown>> => {
  return {
    ...data,
    id
  }
};

export const mockUpdateAsset = async (id:string, data:Record<string,unknown>):Promise<Record<string,unknown>> => {
  return {
    id,
    [DatoFields.AssetMetadata]: data[DatoFields.AssetMetadata],
  }
};
