import { TranslationData, CustomToast } from "../types/shared";

/**
 * @desc Rudimentary validation of export file
 * @param file
 * @returns
 */
export const isExportFileValid = (file:TranslationData) => {
  if(file.lang && file.fields.length > 0){
    return true;
  }
  return false;
}

/**
 * @desc Validates file and settings before import
 * @param file Uploaded translation file
 * @param sourceLang
 * @param locales Existing locales from DatoCMS
 * @returns
 */
export const isImportInvalid = (file: TranslationData | undefined, sourceLang:string, locales:string[]):CustomToast | null => {

  if(!file){
    return  {
      type: 'warning',
      message:`You have to provide a translation file`,
    }
  }
  if(!file.lang){
    return {
      type: 'alert',
      message:`Could not read target language from file`,
    }
  }
  if(file.lang === sourceLang){
    return {
      type: 'alert',
      message:`Target language: (${file.lang}) and source language: (${sourceLang}) cannot be the same`,
    }
  }
  if(file.fields.length === 0){
    return {
      type: 'alert',
      message:'Translation file is empty',
    }
  }
  if(!locales.includes(file.lang)){
    return {
      type: 'warning',
      message:`Target language (${file.lang}) has not been added. Go to supported languages under settings.`,
    };
  }
  return null;
}
