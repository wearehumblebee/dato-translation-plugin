import { Model,TranslationData,TranslationField,TranslationFieldSpecial,FieldsArray,Field, MediaField, SeoField } from '../types/shared';
import { Fields, DatoFields, DatoFieldTypes } from '../helpers/constants';
import { ReferenceRecord, TranslationRecord } from "../types/export";
import { isStringFieldTranslatable } from '../validation/validate';
import { camelize } from 'humps';
import { createField, createSpecialField, createDefaultRecord, constructDefaultAssetRecord, createSEOField } from "./structure/export";

export const parseRecords = (allRecords:Record<string,unknown>[], models:Model[], sourceLang :string):TranslationRecord[] => {

  let result:TranslationRecord[] = [];
  const data = parseParentRecords(allRecords, models, sourceLang);

  // Get modular blocks
  const linkedRecordsAndBlocks = findLinkedRecordsAndBlocks(
    data.records,
    allRecords,
    data.references,
  );

  if (linkedRecordsAndBlocks.length > 0) {
    const linkedBlocksResult = parseLinkedRecordsAndModularBlocks(linkedRecordsAndBlocks, models);

    if (linkedBlocksResult?.length > 0) {
      result = [...data.records, ...linkedBlocksResult];
    } else {
      result = [...data.records];
    }
  }
  return result;
};

const parseParentRecords = (allRecords:Record<string,unknown>[], models:Model[], sourceLang:string):ReferenceRecord => {

  const result = allRecords.reduce(
    (acc:ReferenceRecord, record:Record<string,unknown>) => {
      let model = models.find((x) => x.id === record.itemType);

      if (model) {
        if (
          model.allLocalesRequired &&
          !model.modularBlock
        ) {
          // Regular record
          const transRecord = createRecord(record, model, sourceLang);
          if (transRecord) {

            acc.records.push(transRecord.data);

            if (transRecord.references.length > 0) {
              acc.references.push(...transRecord.references);
            }
          }
        }
      }
      return acc;
    },
    {
      records : [],
      references: [],
    } as ReferenceRecord,
  );

  return result;
};

const parseLinkedRecordsAndModularBlocks = (linkedRecordsAndBlocks:Record<string,unknown>[], models:Model[]) :TranslationRecord[] => {
  const result = linkedRecordsAndBlocks.reduce((acc, record) => {
    // These records dont have any localized flags
    const model = models.find((x) => x.id === record.itemType);
    if (model) {
      const newRecord = createModularBlock(record, model);
      if (newRecord) {
        acc.push(newRecord);
      }
    }

    return acc;
  }, [] as TranslationRecord[]);

  return result;
};

/**
 * @protected
 * @desc Get records that may not have lang props but are linked through modular blocks or linked models
 * @param {array} result
 * @param {array} records
 * @param {array} translatableLinkedRecords
 * @return {array}
 */
const findLinkedRecordsAndBlocks = (transResult:TranslationRecord[], records:Record<string,unknown>[], references:string[]):Record<string,unknown>[] => {
  let result:Record<string,unknown>[] = [];
  if (references.length > 0) {
    const translatableRecords = getTranslatableLinkFromArray(records, references);
    if (translatableRecords) {
      const uniqueRecords = removeAlreadyAddedRecords(transResult, translatableRecords);
      if (uniqueRecords) {
        result = uniqueRecords;
      }
    }
  }
  return result;
};

/**
 * @protected
 * @desc Get list from original records on translatable models
 * @param {array} records
 * @param {array} translatableLinkedModels
 * @return {array}
 */
const getTranslatableLinkFromArray = (records:Record<string,unknown>[], references:string[]):Record<string,unknown>[] => {
  // Removing possible duplicates
  references = [...new Set(references)];

  const result = references.reduce((acc, refId) => {
    const record = records.find((x) => x.id === refId);
    if (record) {
      acc.push(record);
    }
    return acc;
  }, [] as Record<string,unknown>[]);
  return result;
};

/**
 * @protected
 * @desc Making sure we dont add records that is already in our list of records to translate.
 * For example the same model can be linked to multiple models, we should only process unique models for translation
 * @param {array} result The list of records so far...
 * @param {array} translatableRecords List of record id:s found in array props on parent records
 * @return {array}
 */
const removeAlreadyAddedRecords = (result:TranslationRecord[], translatableRecords:Record<string,unknown>[]):Record<string,unknown>[] => {
  const newResult = translatableRecords.reduce((acc, record) => {
    const translatedRecord = result.find((x) => x.id === record.id);
    if (!translatedRecord) {
      // If this record is not in our result add it to list of records to be exported for translation
      acc.push(record);
    }
    return acc;
  }, [] as Record<string,unknown>[]);

  return newResult;
};

const createModularBlock = (record:Record<string,unknown>, model:Model):TranslationRecord | null => {

  const result = model.fieldsReference.reduce((acc, fieldId) => {
    const currentField = model.fields.find((field) => field.id === fieldId);

    if(currentField){
      // DatoCMS also uses "humps" library to camelize and de-camelize keys
      const key = camelize(currentField.apiKey);
      const hint = currentField.hint;
      let value = null;

      if (record[key]) {
        value = record[key];
      }

      const fieldResult = createFieldHelper( currentField, key, value, hint );

      if (fieldResult) {
        acc.push(fieldResult);
      }
    }

    return acc;
  }, [] as FieldsArray);
  //}, [] as TranslationField[]);

  // If no fields can be translated on current block there is no point adding it to export
  if (result.length > 0) {
    return createDefaultRecord(record, model, result);
  }
  return null;
};

/**
 * @desc Record is structure with possible lang properties { en: "Bosse" } or { en: ["111","222"]}
 * @param {object} Dato record
 * @param {object} Object with { Dato model, Model fields for model }
 * @param {string} lang "en"
 * @return { object | null }
 */
const createRecord = (record:Record<string,unknown>, model:Model, lang:string): {data: TranslationRecord, references:string[]} | null => {
  // Array holding id:s of modular blocks and linked array records
  let referenceIdArray:string[] = [];

  const items = model.fieldsReference.reduce((acc, fieldId) => {
    const currentField = model.fields.find((field) => field.id === fieldId);

    if(currentField?.localized){
      const key = camelize(currentField.apiKey);
      const hint = currentField.hint;
      let value = null;

      if(record[key]){
        const recordKey = record[key] as Record<string, unknown>;

        if(recordKey[lang]){
          value = recordKey[lang];
        }
      }

      const fieldResult = createFieldHelper(
        currentField,
        key,
        value,
        hint,
      );

      if (fieldResult) {
        if (fieldResult.type !== 'reference') {
          acc.push(fieldResult);
        } else {
          // ugly as balls
          if(currentField.fieldType === DatoFieldTypes.Link){
            referenceIdArray = [...referenceIdArray, value as string];
          }else{
            referenceIdArray = [...referenceIdArray, ...value as []];
          }

        }
      }
    }

    return acc;
  }, [] as FieldsArray);

  // If no fields can be translated on current record there is no point adding it to export
  if (items.length > 0) {
    const newRecord = createDefaultRecord(record, model, items);
    return {
      data: newRecord,
      references: referenceIdArray,
    };
  }
  return null;
};

/**
 * @desc Creates field structure based on DatoCMS fieldType
 * @param {fieldType: string, key: string, value: string | number | object, hint: string}
 * @returns
 */
const createFieldHelper = (field:Field, key:string, value:unknown, hint:string | null ): TranslationField | TranslationFieldSpecial | null => {
  let result = null;

  // Skip all empty values from source language
  if (value) {
    switch (field.fieldType) {
      case DatoFieldTypes.String: {
        if(isStringFieldTranslatable(field, value as string)){
          result = createField( {key, value, hint} );
        }
        break;
      }
      case DatoFieldTypes.Text:
      case DatoFieldTypes.Integer:
      case DatoFieldTypes.Float:
        result = createField({ key, value, hint });
        break;
      case DatoFieldTypes.File: {
        // We only take meta title and alt fields for translation
        // if they dont exist this field will not be sent for tranlations
        result = createTranslationField( key, value as MediaField);
        break;
      }
      case DatoFieldTypes.Seo: {
        const seoField = value as SeoField;
        result = createSEOField({ key, value :seoField, hint });
        break;
      }
      case DatoFieldTypes.Links:
      case DatoFieldTypes.RichText: {
        if(value){
          // we have no idea what shape the array is and it does not matter here
          const list = value as [];
          if(list.length > 0){
            result = {
              type: 'reference',
              value,
              fieldName: "",
            } as TranslationField;
          }
        }
        break;
      }
      case DatoFieldTypes.Link:{
        if(value){
          result = {
            type: 'reference',
            value: [value],
            fieldName: "",
          } as TranslationField;
        }
        break;
      }
      default:
        // other data types could be added here if needed
        // 'date':
        // 'date_time'
        break;
    }
  }

  return result;
};

/**
 * @desc Parse assets from Dato
 * @param {array} assets Array of assets from Dato API
 * @param {string} lang source language to translate from
 * @return {array}
 */
export const parseAssets = (assets:Record<string,unknown>[], lang = 'en'):TranslationRecord[] => {

  // We dont care about the asset type (image, video, document), we are only interested in the meta data object for assets
  const result = assets.reduce((acc, asset:Record<string,unknown>) => {
    const field = asset[DatoFields.AssetMetadata] as Record<string,unknown>;

    if (field && field[lang]) {

      const fieldKey = field[lang] as MediaField;
      // alt and title fields
      const metaList = createFileMetaFields(fieldKey);

      if (metaList.length > 0) {
        const record = constructDefaultAssetRecord(asset, metaList);
        acc.push(record);
      }
    }

    return acc;
  }, [] as TranslationRecord[]);

  return result;

};

/**
 * @desc Create local media object (image, video) only with meta data (alt, title), never the image or video url
 * @param {string} key
 * @param {string} value
 * @return {array} -
 */
const createTranslationField = ( key:string, value:MediaField ) : TranslationFieldSpecial | null => {
  const result = createFileMetaFields(value);
  return result.length > 0 ? createSpecialField( {key, fields: result} ) : null;
};

/**
 * @desc Create local media array (image, video, document) only with meta data (alt, title), never the image or video url
 * @param {string} value
 * @return {array}
 */
const createFileMetaFields = (value:MediaField):TranslationField[] => {
  let result = [];
  if (value?.alt) {
    result.push(createField({ key: DatoFields.MediaAlt, value: value.alt }));
  }
  if (value?.title) {
    result.push(createField({ key: DatoFields.MediaTitle, value: value.title }));
  }
  return result;
};

// interface createSEOFieldArgs  {
//   key:string;
//   value: SeoField;
//   hint:string | null;
// }

/**
 * @desc Helper to create SEO DatoCMS standard object with { title, description }, disregarding image for now
 * @param {string} key
 * @param {string} value
 * @return {array} -
 */
// const createSEOField = ( {key, value, hint}:createSEOFieldArgs ): TranslationFieldSpecial | null => {
//   let result = [];
//   if (value?.title) {
//     result.push(createField({ key: DatoFields.SeoTitle, value: value.title }));
//   }
//   if (value?.description) {
//     result.push(createField({ key: DatoFields.SeoDescription, value: value.description }));
//   }

//   return result.length > 0
//     ? createSpecialField({ key, hint, fields:result })
//     : null;
// };

/**
 * @desc Helper to create string | text field. {fieldName: "key", value: "Hello hello"}
 * @param {string} key
 * @param {string} value
 * @param {string} hint Hint from dato about what the field does
 * @return {object} { id: "434344", itemType: "123456", fields: []}
 */
// const createField = ({ key, value, hint }:CreateFieldArgs) :TranslationField => {
//   return {
//     [Fields.Name]:key,
//     [Fields.Value]: value,
//     [Fields.Hint]: hint || "",
//   }
// };

/**
 * @desc Helper to create File (media) or SEO field.
 * @param {string} key
 * @param {string} hint Hint from dato about what the field does
 * @param {array} List of regular TranslationFields
 * @return {object} { id: "434344", itemType: "123456", fields: []}
 */
// const createSpecialField = ({key, hint,fields}:CreateSpecialFieldArgs) : TranslationFieldSpecial => {
//   return {
//     [Fields.Name]:key,
//     [Fields.Hint] : hint || "",
//     [Fields.Items]: fields
//   }
// }

/**
 * @desc Merges assets data with regular records
 * @param {array} records
 * @param {array} assets
 * @return {object}
 */
export const formatFileResult = (records:TranslationRecord[], assets:TranslationRecord[], lang :string):TranslationData => {
  let result:TranslationRecord[] = [];
  if(assets.length > 0){
    result = [...records, ...assets];
  }else{
    result = [...records];
  }

  return {
    [Fields.Lang] : lang,
    [Fields.Items]: result
  }
}

/**
 * @desc Helper function to create a record. id of record, itemType of record, needed when creating a new record on import
 * @param {object} item Dato record
 * @param {object} model Dato model
 * @param {items} Optional init items
 * @return {object} { id: "434344", itemType: "123456", fields: []}
 */
// const createDefaultRecord = (record:Record<string,unknown>, model:Model, items:FieldsArray):TranslationRecord => {

//   const defaultRecord = {
//     id: record.id,
//     itemType: model.id,
//     modelName: model.name,
//     hint: model.hint || '',
//   } as TranslationRecord

//   if(items.length > 0){
//     defaultRecord.fields = items;
//   }
//   return defaultRecord;
// };

/**
 * @desc Helper function to create an asset record.
 * @param {object} item Dato record or Dato asset
 * @param {items} Optional init items
 * @return {object} { id: "434344", itemType: "123456", fields: []}
 */
// export const constructDefaultAssetRecord = (record:Record<string,unknown>, items:TranslationField[]):TranslationRecord => {
//   return {
//     id: record.id,
//     // Assets dont have itemType (model id), using this to differentiate records from assets
//     itemType: ItemTypes.Media,
//     modelName: '',
//     fields: items && items.length > 0 ? items : [],
//   } as TranslationRecord
// };
