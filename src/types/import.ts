import { Field, FieldsArray } from './shared';

export type ImportSettings = {
  isDryRun: boolean,
  dontCreateRecords: boolean,
  createBackupFile: boolean,
}

export type TranslationRefs = {
  records: TranslationRecord[],
  assets: TranslationRecord[]
}

/**
 * @desc Almost identical to TranslationRecord from export types but fields are never optional
 */
export type TranslationRecord = {
  id:string;
  itemType:string;
  modelName: string;
  hint:string;
  fields: FieldsArray;
}

/**
 * @desc Transit record holding data for the record and meta data about they type etc
 */
export type CreateRecordRef = {
  item:LinkRecordRef | LinkRecordRef[], // name sucks change
  parentField:Field,
  parentRecord: Record<string,unknown>,
  fieldType:string
}

export type UpdateRecordRef = {
  id: string,
  data: Record<string,unknown>
}

export type LinkRecordRef = {
  data:Record<string,unknown>,
  meta: {
    id: string,
    itemType:string
  }
}

export type RecordsAndBlocks = {
  records: CreateRecordRef[],
  modularBlocks: CreateRecordRef[]
}

export type CreatedRecord = {
  newRecord: Record<string,unknown>,
  reference: CreateRecordRef
}
