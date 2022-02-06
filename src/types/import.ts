import { Field, FieldsArray } from './shared';

export type ImportSettings = {
  isTestMode: boolean,
  dontCreateRecords: boolean,
  createBackupFile: boolean,
  downloadLogsOnDone: boolean,
}

/**
 * @desc Almost identical to TranslationRecord from export types but fields are never optionsl
 */
export type TranslationRecord = {
  id:string;
  itemType:string;
  name: string; // TODO : called modelName in export is this right?
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
