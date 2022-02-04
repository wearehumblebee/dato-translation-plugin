import { FileData } from "../types/shared";

  export const isExportFileValid = (data:FileData):boolean => {

    if(data.fields.length === 0){
      return false;
    }
    if(!data.lang){
      return false;
    }
    return true;
  }
