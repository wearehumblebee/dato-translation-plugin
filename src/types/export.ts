import { FieldsArray ,TranslationData } from "./shared"

export type ExportSettings = {
  exportOnlyPublishedRecords: boolean,
  exportAssets: boolean,
  exportContent: boolean
}

export type ReferenceRecord = {
  records: TranslationRecord[],
  references: string[]
}

/**
 * @desc Almost identical to TranslationRecord from export types but fields are never optionsl
 */
 export type TranslationRecord = {
  id:string;
  itemType:string;
  modelName: string;
  hint:string;
  fields?: FieldsArray;
}

export type ExportSummary = {
  file: TranslationData,
  recordsCount: number;
  assetsCount: number;
}
