import { FileData } from "../types/shared";

export const createJSONBlob = (data:FileData):Blob => {
  return new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
};
