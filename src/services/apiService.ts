import {  ModelBlock } from 'datocms-plugin-sdk';
import { Model, ReferenceData } from '../types/shared';
import { CreatedRecord } from '../types/import';
import { fetchRecords, fetchAssets } from "../api/queries";
import { LogType, LogStatus} from './../types/logger';
import { CreateRecordsArgs,UpdateRecordsArgs } from "./interfaces";
import { createRecord, updateRecord, updateAsset, fetchFields, bulkPublishRecords } from "../api/queries";
import { DatoFields } from '../helpers/constants';
import { camelize } from 'humps';

/**
 * Business logic service for api.
 *
 */

/**
 * @desc Fetches records models
 * @param {client} DatoCMS SiteClient for accessing the content management API
 * @param {object} settings
 * @returns
 */
 export const fetchDataForExport = async ( client: any, fetchOnlyPublishedRecords:boolean, fetchContentData:boolean, fetchAssetsData:boolean ):Promise<ReferenceData> => {

  let promises : Promise<Record<string,unknown>[]>[] = [];
  if (fetchContentData) {
    promises.push(fetchRecords(client, fetchOnlyPublishedRecords));
  }

  if (fetchAssetsData) {
    promises.push(fetchAssets(client));
  }

  if(fetchContentData && fetchAssetsData){
    const [records, assets] = await Promise.all(promises);
    return {
      records,
      assets,
      models:[]
    }
  }else if(fetchContentData && !fetchAssetsData){
    const [ data ] = await Promise.all(promises);
    return {
      records:data,
      assets: [],
      models:[]
    }
  }else{
    const [ data ] = await Promise.all(promises);
    return {
      records:[],
      assets: data,
      models:[]
    }
  }
};

export const fetchFieldsForModels = async(client: any, itemTypes: Partial<Record<string,ModelBlock>>) : Promise<Model[]> => {

  let models : Model[] = [];

  for (const [modelId, data] of Object.entries(itemTypes)) {
    const fields = await fetchFields(client, modelId);

    const fieldsReferences = data?.relationships.fields.data.map(x => x.id);

    if(data?.attributes){
      models.push({
        id: modelId,
        name: data?.attributes.name,
        singleton: data?.attributes.singleton,
        // Matching with records requires camelized version of apiKey. Dato uses humps internally so the match should be good
        apiKey: camelize(data.attributes.api_key),
        allLocalesRequired: data.attributes.all_locales_required,
        modularBlock: data.attributes.modular_block,
        hint: data.attributes.hint,
        fields,
        fieldsReference : fieldsReferences || []
      })
    }
  }

  return models;

}

export const createRecords = async ({client, records,logger, isDryRun }:CreateRecordsArgs):Promise<CreatedRecord[]> => {
  const context = "createRecords";
  const createdRecords:CreatedRecord[] = [];

  for(let i = 0,len=records.length;i < len;i++){
    let newRecord;

    try{
      newRecord = await createRecord(client, records[i], isDryRun);
      logger.log({context,status:LogStatus.Ok,type:LogType.Create })
    }catch(error){
      console.error(error);
      logger.log({context,status:LogStatus.Error,type:LogType.Create, error:error as Record<string,unknown>, item:records[i]});
    }

    if (newRecord) {
      createdRecords.push({
        newRecord,
        reference: records[i],
      })
    }
  }

  return createdRecords;
};

export const updateRecords = async ({ client, records, logger, isDryRun}:UpdateRecordsArgs ):Promise<void> => {
  const context = 'updateRecords';

  for(let i=0,len=records.length;i < len; i++){
    try{
      await updateRecord(client, records[i],isDryRun);
      logger.log({context,status:LogStatus.Ok,type:LogType.Update })
    }catch(error){
      console.error(error);
      logger.log({context,status:LogStatus.Error,type:LogType.Update, error:error as Record<string,unknown>, item:records[i]});
    }
  }
};

export const updateAssets = async ({ client, records,logger, isDryRun}:UpdateRecordsArgs ):Promise<void> => {
  const context = 'updateAssets';

  for(let i=0,len=records.length;i<len;i++){
    try{
      await updateAsset(client, records[i], isDryRun);
      logger.log({context,status:LogStatus.Ok,type:LogType.UpdateAsset })
    }catch(error){
      console.error(error);
      logger.log({context,status:LogStatus.Error,type:LogType.UpdateAsset, item:records[i], error: error as Record<string,unknown> })
    }
  }
};

export const publishAllRecords = async(client:any, isDryRun:boolean) :Promise<number> => {


  const records = await fetchRecords(client, false);

  if(records.length > 0){
    const result = filterNonPublishableRecords(records);
    if(result.length > 0){
      if(isDryRun){
        return result.length;
      }else{

        await bulkPublishRecords(client, result);
        return result.length;
      }
    }
  }
  return 0;
}

const filterNonPublishableRecords = (records:Record<string,unknown>[]):string[] => {
  return records.reduce((acc, record) => {
    // modular blocks cant be published
    // modular blocks does not have creator field
    if (record.hasOwnProperty(DatoFields.Creator)) {
      const metaField = record[DatoFields.Meta] as Record<string,unknown>;

      if(metaField){
        if(metaField[DatoFields.Status] !== "published"){
          acc.push(record.id as string);
        }
      }
    }
    return acc;
  }, [] as string[])
}
