import { TranslationData } from "../types/shared";

export const downloadFile = (data:any, fileName:string):void => {
  if(data && fileName){
    const blob = createJSONBlob(data);

    if(blob){
      const dataUri = URL.createObjectURL(blob);

      let linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', `${fileName}-${new Date().toISOString()}.json`);
      linkElement.click();
    }
  }
};

const createJSONBlob = (data:TranslationData):Blob | null => {

  let jsonData:string = "";
  try{
    jsonData = JSON.stringify(data, null, 2);
  }catch(error){
    console.error(error);
  }

  if(jsonData){
    return new Blob([jsonData], {
      type: 'application/json',
    });
  }
  return null;

};
