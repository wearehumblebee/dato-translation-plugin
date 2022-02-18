import { CreateRecordRef, TranslationRecord, UpdateRecordRef } from './../types/import';
import { Model ,TranslationField } from '../types/shared';
import Logger from "../helpers/logger";

interface ApiBase {
  client:any;
}

interface MutateBase extends ApiBase {
  logger: Logger,
  isDryRun:boolean;
}

export interface CreateRecordsArgs extends MutateBase {
  records:CreateRecordRef[]
}

export interface UpdateRecordsArgs extends MutateBase {
  records:UpdateRecordRef[]
}

export interface ImportAssetsArgs {
  client:any;
  records:Record<string,unknown>[],
  translations: TranslationRecord[],
  sourceLang:string,
  targetLang:string,
  logger:Logger,
  isDryRun: boolean
}

export interface ImportRecordsArgs extends ImportAssetsArgs {
  models: Model[],
  dontCreateRecords:boolean;
}

export interface CreateFieldArgs {
  key:string;
  value: unknown,
  hint?:string | null;
}

export interface CreateSpecialFieldArgs {
  key:string;
  fields: TranslationField[];
  hint?:string | null;
}
