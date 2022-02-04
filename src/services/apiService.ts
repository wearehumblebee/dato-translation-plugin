import {  ModelBlock } from 'datocms-plugin-sdk';
import { ExportSettings, ExportData } from "../types/export";
import { Model, Field } from '../types/shared';
import { fetchRecords, fetchAssets } from "../api/queries";
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
 export const fetchDataForExport = async ( client: any, settings:ExportSettings ):Promise<ExportData> => {

  let promises : Promise<Record<string,unknown>[]>[] = [];
  if (settings.exportContent) {
    promises.push(fetchRecords(client, settings.exportOnlyPublishedRecords));
  }

  if (settings.exportAssets) {
    promises.push(fetchAssets(client));
  }

  if(settings.exportContent && settings.exportAssets){
    const [records, assets] = await Promise.all(promises);
    return {
      records,
      assets
    }
  }else if(settings.exportContent && !settings.exportAssets){
    const [ data ] = await Promise.all(promises);
    return {
      records:data,
      assets: []
    }
  }else{
    const [ data ] = await Promise.all(promises);
    return {
      records:[],
      assets: data
    }
  }
};

export const fetchFieldsForModels = async(client: any, itemTypes: Partial<Record<string,ModelBlock>>) : Promise<Model[]> => {

  //let promises : Promise<Field[]>[] = [];

  let models : Model[] = [];

  for (const [modelId, data] of Object.entries(itemTypes)) {

    //promises.push(fetchFields(client, modelId));
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

const fetchFields = async(client: any, modelId: string):Promise<Field[]> => {
  let fields : Field[] = [];
  fields = client.fields.all(modelId);

  return fields;
}
