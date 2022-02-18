import { CreateRecordRef,UpdateRecordRef, LinkRecordRef } from '../types/import';
import { mockCreateRecord, mockUpdateRecord, mockUpdateAsset } from '../helpers/mock';
import { Field } from '../types/shared';

/**
   * @desc Fetch all records in from Dato instance. Records is content
   * @param client SiteClient from "datocms-client" package
   * @param {boolean} fetchOnlyPublished Fetch only published records or latest changes
   */
 export const fetchRecords = async (client:any, onlyPublished:boolean):Promise<Record<string,unknown>[]> => {
  const params = {
    version: onlyPublished ? 'published' : 'latest',
  };
  // TODO CHECK THIS GUY OUT.....
  //     nested  string  Optional
  // For Modular Content fields and Structured Text fields, return full payload for nested blocks instead of IDs

  return client.items.all({ ...params }, { allPages: true });

};

export const fetchAssets = async (client:any):Promise<Record<string,unknown>[]> => {
  // we could filter on asset type here if we want, fetching all for now
  const filter = {
    //"filter[type]": "image",
  };
  return client.uploads.all(filter, { allPages: true });
};

export const fetchFields = async(client: any, modelId: string):Promise<Field[]> => {
  let fields : Field[] = [];
  fields = client.fields.all(modelId);

  return fields;
}

export const updateRecord = async(client:any, record:UpdateRecordRef, isDryRun:boolean):Promise<void> => {
  if(isDryRun){
    await mockUpdateRecord(record.id, record.data);
  }else{
    await client.items.update(record.id, record.data);
  }
}

export const createRecord = async ( client:any, record:CreateRecordRef, isDryRun :boolean):Promise<Record<string,unknown> | null> => {
  let newRecord : Record<string,unknown> | null = null;
  const linkRecord = record.item as LinkRecordRef;

  const item = {
    itemType: linkRecord.meta.itemType,
    ...linkRecord.data
  }

  if (isDryRun) {
    newRecord = await mockCreateRecord(item);
  } else {
    newRecord = await client.items.create(item);
  }
  return newRecord;
};

export const updateAsset = async (client:any, record:UpdateRecordRef, isDryRun:boolean):Promise<void> => {
  if(isDryRun){
    await mockUpdateAsset(record.id, record.data);
  }else{
    await client.uploads.update(record.id, record.data);
  }
}

/**
   * @desc Publish unpublished records in bulk
   * @param {array} records, array of record id:s ["666", "555"]
   */
 export const bulkPublishRecords = async (client:any, records:string[]):Promise<void> => {
  await client.items.bulkPublish({
    items: records,
  });
};
