import {  DatoFieldTypes, DatoFields, ItemTypes } from '../helpers/constants';
import { Model,Field,TranslationData,TranslationField,TranslationFieldSpecial, SeoValidator } from '../types/shared';
import { LinkRecordRef,CreateRecordRef,UpdateRecordRef, RecordsAndBlocks ,TranslationRecord, CreatedRecord, TranslationRefs } from "../types/import";
import {
  isNumericString,
  isObjectEmpty,
  objectifyFields,
  buildModularBlockHelper,
} from '../helpers/parseHelper';
import { ImportRecordsArgs, ImportAssetsArgs } from "../services/interfaces";
import { createRecords, updateRecords, updateAssets } from "../services/apiService";
import Logger from "../helpers/logger";
import { LogType, LogStatus } from '../types/logger';
import { camelize, decamelize } from 'humps';

export const importRecords = async({client, records, models, translations,sourceLang, targetLang, logger, isDryRun, dontCreateRecords}:ImportRecordsArgs) => {
  let result : UpdateRecordRef[];

  // Merge existing "regular fields" translations from DatoCMS with new translations from file
  const mergedTranslations = mergeRecordTranslations(records, models, translations, logger, sourceLang, targetLang);

  console.log({mergedTranslations});

  const createData = findRecordsAndBlocksToCreate(records, models, translations, sourceLang);

  console.log({createData});

  // Merge existing modular block translations from DatoCMS with new translations from file
  const mergedWithModularBlocks = mergeModularBlocks( mergedTranslations, createData.modularBlocks, targetLang);

  console.log({mergedWithModularBlocks});

if(!dontCreateRecords){
  // createData.records may contain duplicates where the same record (link) is used in multiple places
  const recordsToCreate = flattenAndDeDuplicate(createData.records);

  console.log({recordsToCreate});

  // Calls DatoCMS and creates new records
  const createdRecords = await createRecords({client, records: recordsToCreate, logger, isDryRun});
  console.log({createdRecords});

  // Merge newly created record id:s to our reference list of records
  const mergedCreatedRecords = mergeNewRecords(createdRecords,createData.records);
  console.log({mergedCreatedRecords});

  // Merge existing record links translations from DatoCMS with newly created records
  result = mergeCreatedRecords(mergedWithModularBlocks,mergedCreatedRecords, targetLang);
  console.log({result});
 }else{
   // If an import is run without creating records "mergedWithModularBlocks" is the final result
   // This could be useful if you want to run an import a second time for some reason and the second run would create duplicates of created records
    result = mergedWithModularBlocks;
 }
 await updateRecords({client, records: result, logger, isDryRun});

}

export const importAssets = async({client, records, translations,sourceLang, targetLang, logger, isDryRun}:ImportAssetsArgs) => {
  const mergedAssets = mergeAssetsToUpdate(records, translations, sourceLang, targetLang);
  await updateAssets({client, records:mergedAssets, logger, isDryRun})
}

export const mergeRecordTranslations = (
  records: Record<string,unknown>[],
  models:Model[],
  translations: TranslationRecord[],
  logger:Logger,
  sourceLang:string,
  targetLang:string,
):UpdateRecordRef[] => {
  const result = records.reduce((acc, record) => {

    let model = models.find((x) => x.id === record.itemType);

    if (model && model.allLocalesRequired && !model.modularBlock) {
      const translation = translations.find((item) => item.id === record.id);

      if (translation) {
          // Regular record
          const updateRecord = mergeUpdateRecord(
            record,
            translation,
            model.fields,
            logger,
            targetLang,
            sourceLang,
          );
          if (updateRecord) {
            acc.push(updateRecord);
          }
      }
    }
    return acc;
  }, [] as UpdateRecordRef[]);

  return result;
};

/**
 * @desc Puts modular blocks on their parent records. Modular blocks are always arrays.
 * @param {object} param0
 * @param {object} mergedTranslations
 * @param {array} modularBlocks
 * @returns {object} { lang:string, fields:array }
 */
export const mergeModularBlocks = ( mergedTranslations:UpdateRecordRef[], modularBlocks:CreateRecordRef[], targetLang:string ):UpdateRecordRef[] => {

  // Merging existing block represented by id:s for blocks with new blocks. Ex:
  // {
  //   en: [ "25326879", "25326880" ], // Old translations in "en"
  //   sv: [] // We are merging in new blocks here
  // }

  const result = modularBlocks.reduce((acc, block) => {
    const record = mergedTranslations.find((x) => x.id === block.parentRecord.id);
    if (record) {
      const key = camelize(block.parentField.apiKey);
      const blockItems = block.item as LinkRecordRef[];
      const preparedBlocks = blockItems.map((item) => {
        return buildModularBlockHelper(item.data, item.meta.itemType);
      });
      if (preparedBlocks?.length > 0) {

        acc.push({
          ...record,
          data: {
            ...record.data,
            [key]: {
              ...block.parentRecord[key] as Record<string,string[]>,
              [targetLang]: preparedBlocks
            }
          },
        });
      }
    }

    return acc;
  }, [] as UpdateRecordRef[]);

  return mergeRecordsForUpdate(mergedTranslations, result);
};

export const mergeCreatedRecords = ( mergedTranslations:UpdateRecordRef[], mergedCreatedRecords:CreateRecordRef[], targetLang:string): UpdateRecordRef[] => {
  // First merge the created id, with existing translations from Dato
  // Example { en: "666", sv: null } -> { en: "666", sv:"555" }
  const result = mergedTranslations.reduce((acc, translation) => {
    const createdRecords = mergedCreatedRecords.filter(
      (record) => record.parentRecord.id === translation.id,
    );

    if (createdRecords.length > 0) {
      const mergedFields = createdRecords.reduce((innerAcc, record) => {

        const fieldKey = camelize(record.parentField.apiKey);
        const existingTranslation = record.parentRecord[fieldKey] as Record<string,unknown>;

        switch (record.fieldType) {
          case DatoFieldTypes.Link: {
            const item = record.item as LinkRecordRef;
            if (existingTranslation) {
              innerAcc[fieldKey] = {
                ...existingTranslation,
                [targetLang]: item.data.id,
              };
            }
            break;
          }
          case DatoFieldTypes.Links: {
            const items = record.item as LinkRecordRef[];
            const linkIdArray = items.map((x) => x.data.id);
            innerAcc[fieldKey] = {
              ...existingTranslation,
              [targetLang]: linkIdArray,
            };
            break;
          }
        }
        return innerAcc;
      }, {} as Record<string,unknown>);

      if (!isObjectEmpty(mergedFields)) {
        acc.push({
          ...translation,
          data: {
            ...translation.data,
            ...mergedFields,
          },
        });
      }
    } else {
      // no created records, pass along as is
      acc.push(translation);
    }
    return acc;
  }, [] as UpdateRecordRef[]);

  // TODO how to deal with created records that dont have any parent translations to me merged to????
  return result;
};

/**
 * @desc Combines arrays to a new array without duplicates where newRecords takes precedence
 * @param {array} records
 * @param {array} newRecords
 * @returns {array}
 */
const mergeRecordsForUpdate = (records:UpdateRecordRef[], newRecords:UpdateRecordRef[]):UpdateRecordRef[] => {
  if (newRecords.length === 0) {
    // No unnecessary looping if we have no new records to merge
    return records;
  }
  const result = records.reduce((acc, record) => {
    const upgradedRecord = newRecords.find((item) => item.id === record.id);
    if (upgradedRecord) {
      acc.push(upgradedRecord);
    } else {
      acc.push(record);
    }
    return acc;
  }, [] as UpdateRecordRef[]);

  return result;
};

/**
 * @desc Merges regular fields (string, number etc) translation data to their records
 * @param {object} record, DatoCMS record
 * @param {object} translation, Row from translation file
 * @param {array} Array of DatoCMS fields
 * @param {string} targetLang E.g [ "en" | "sv" ]
 * @param {string} sourceLang E.g [ "en" | "sv" ]
 * @returns { object | null }
 */
const mergeUpdateRecord = ( record:Record<string,unknown>, translation:TranslationRecord, fields:Field[], logger:Logger, targetLang:string, sourceLang :string): UpdateRecordRef | null => {
  const data = translation.fields.reduce((acc, translationField) => {
    const apiKey = decamelize(translationField.fieldName, { separator: '_' });
    const field = fields.find((x) => x.apiKey === apiKey);

    if (field && field.localized) {
      switch (field.fieldType) {
        case DatoFieldTypes.String:
        case DatoFieldTypes.Text: {
          const currentField = translationField as TranslationField;
          if (record[translationField.fieldName]) {
            const value = record[translationField.fieldName] as Record<string,unknown>;
            acc[translationField.fieldName] = {
              ...value,
              [targetLang]: currentField.value || '',
            } as Record<string,unknown>;
          }
          break;
        }
        case DatoFieldTypes.Integer:
        case DatoFieldTypes.Float: {
          const currentField = translationField as TranslationField;
          const numberField = mergeNumberField(
            record,
            currentField,
            field,
            sourceLang,
            targetLang,
          );
          if (numberField) {
            acc[translationField.fieldName] = numberField;
          }
          break;
        }
        case DatoFieldTypes.File:
        case DatoFieldTypes.Seo: {
          const currentField = translationField as TranslationFieldSpecial;

          // Files (media) and SEO object are predefined objects sitting directly on a record
          const objectField = mergeObjectField(record, currentField, field, logger, sourceLang, targetLang );

          if (objectField) {
            acc[translationField.fieldName] = objectField;
          }
          break;
        }
        default:
          break;
      }
    }
    return acc;
  }, {} as Record<string,unknown>);

  // paranoia check if fields have been removed after export
  if (isObjectEmpty(data)) {
    return null;
  }

  return {
    id: record.id as string,
    data,
  };
};

/**
 * @desc SEO or File fields are somewhat unique as they are predefined objects directly on a record
 * @param {record, translation, sourceLang, targetLang}
 * @returns {object}
 */
const mergeObjectField = ( record:Record<string, unknown>, translation:TranslationFieldSpecial, field:Field, logger:Logger, sourceLang:string, targetLang:string ):Record<string,unknown> | null => {
  // paranoia check, field may have been removed after export
  if (record[translation.fieldName]) {
    const newTranslation = objectifyFields(translation.fields);

    if (newTranslation) {
      const strippedTranslation = validateAndStripSEO(newTranslation, field, logger);
      const sourceTranslationField = record[translation.fieldName] as Record<string,unknown>;
      const sourceTranslation = { ...sourceTranslationField[sourceLang] as Record<string,unknown> } as Record<string,unknown>;

      // Merge fields from source that are not sent to translation E.g image for "seo", "focalPoint" for image etc
      const mergedTranslation = { ...sourceTranslation, ...strippedTranslation };

      return {
        ...record[translation.fieldName] as Record<string,unknown>,
        [targetLang]: {
          ...mergedTranslation,
        },
      } as Record<string,unknown>;
    }
  }
  return null;
};

const mergeNumberField = ( record:Record<string,unknown>, translation:TranslationField, field:Field, sourceLang:string, targetLang:string ):Record<string,unknown> | null => {
  let translationValue = 0;

  if (typeof translation.value === 'number') {
    translationValue = translation.value as number;
  } else {
    // If by happenstance we get a stringified value, try to parse to proper type
    if (isNumericString(translation.value as string)) {
      translationValue =
        field.fieldType === 'float'
          ? parseFloat(translation.value as string)
          : parseInt(translation.value as string);
    } else {
      // Almost out of luck, but we may have a default value set for field, try to use it if available
      //translationValue = field.defaultValue[sourceLang];
    }
  }
  const existingTranslation = record[translation.fieldName] as Record<string,unknown>;

  // paranoia check, field may have been removed after export
  if (existingTranslation) {
    return {
      ...existingTranslation,
      [targetLang]: translationValue,
    };
  }
  return null;
};

/**
 * @desc Finds and merges translation data for records that should be created and for modular blocks.
 * These are very similar in structure with the huge difference that records has to be created and modular block data
 * is just added to their parent record and by updating the parent the block is created.
 * @param {object} param0
 * @param {array} DatoCMS records
 * @param {array} DatoCMS models with their fields
 * @param {string} Source language we are translating from
 * @returns {object} {records:array, modularBlocks: array}
 */
 export const findRecordsAndBlocksToCreate = (records:Record<string,unknown>[], models:Model[], translations:TranslationRecord[], sourceLang:string ):RecordsAndBlocks => {
  const result = records.reduce((recAcc, record) => {
    let model = models.find((x) => x.id === record.itemType);

    // If model is not translatable there is nothing for us to do
    // Modular blocks dont have translatable fields on them, either the block is translatable or not
    if (
      model?.allLocalesRequired &&
      !model?.modularBlock
    ) {
      const recordsToCreate = model.fields.reduce((acc, field) => {
        const key = camelize(field.apiKey);
        const recordField = record[key] as Record<string,unknown>;

        switch (field.fieldType) {
          case DatoFieldTypes.Link: {
            const newRecord = createDatoLinkRecord(
              field,
              recordField,
              translations,
              sourceLang,
            );
            if (newRecord) {
              acc.push({
                item: newRecord,
                parentField: field,
                parentRecord: { ...record },
                fieldType: field.fieldType,
              });
            }
            break;
          }
          // TODO check what happens if links are translatable both as field and fields in record
          case DatoFieldTypes.Links:
          case DatoFieldTypes.RichText: {
            const data = createDatoArrayLinkRecords(
              field,
              recordField,
              translations,
              sourceLang,
            );

            if (data) {
              // parent record and field is needed to update record with created id:s later
              // modular blocks are created by updating them direclty on the record.
              acc.push({
                item: data,
                parentField: field,
                parentRecord: { ...record },
                fieldType: field.fieldType,
              });
            }
          }
        }
        return acc;
      }, [] as CreateRecordRef[]);

      recAcc.push(...recordsToCreate);
    }

    return recAcc;
  },[] as CreateRecordRef[]);

  return splitRecordsAndModularBlocks(result);
};

/**
 * @desc Helper that formats link translation data into record for creating in DatoCMS.
 * @param {object}
 * @param {object} field object from DatoCMS
 * @param {object} recordField, field object from Dato record with current translations. E.g { en: { name: "Bosse"}, sv: null}}
 * @param {array} Translations from translation file
 * @param {string} Source lang used for export
 * @returns { object | null }
 */
const createDatoLinkRecord = ( field:Field, recordField:Record<string,unknown>, translations:TranslationRecord[], sourceLang :string) : LinkRecordRef | null=> {
  if (field.localized) {
    if (recordField && recordField[sourceLang]) {
      const translationId = recordField[sourceLang];
      const translationToCreate = translations.find((item) => item.id === translationId);

      return constructRecordToCreate( translationToCreate );
    }
  }
  return null;
};

/**
 * @desc Helper that formats translation data for arrays of links and modular blocks into record for creating in DatoCMS.
 * @param {object}
 * @param {object} field object from DatoCMS
 * @param {object} recordField, field object from Dato record with current translations. E.g { en: { name: "Bosse"}, sv: null}}
 * @param {array} Translations from translation file
 * @param {string} Source lang used for export
 * @returns { object | null }
 */
const createDatoArrayLinkRecords = ( field:Field, recordField:Record<string,unknown>, translations:TranslationRecord[], sourceLang:string ):LinkRecordRef[] => {
  if (field.localized) {
    // Modular blocks and linked records separated by field type in result
    const translationIdArray = recordField[sourceLang] as string[]

    // Get translations for modular blocks
    const translationToCreate = translations.filter((item) => translationIdArray.includes(item.id));

    return translationToCreate.reduce((transAcc, trans) => {

      const record = objectifyFields(trans.fields as TranslationField[]);
      if (record && !isObjectEmpty(record)) {
        transAcc.push(formatCreateRecord(record, trans));
      }
      return transAcc;
    }, [] as LinkRecordRef[]);
  }
  return [];
};

/**
 * @desc Helper function formatting object that will be used by actual API create function
 * @param {object} param0
 * @returns
 */
const constructRecordToCreate = ( translation:TranslationRecord | undefined ):LinkRecordRef | null => {

  if (!translation || !translation.fields || translation.fields.length === 0) {
    return null;
  }
  const record = objectifyFields(translation.fields as TranslationField[]);

  if (record && !isObjectEmpty(record)) {
    return formatCreateRecord(record, translation);
  }
  return null;
};

/**
 * @desc Formats record for create with a data object for creation and reference object for updating created record on parents later on
 * @param {object} record
 * @param {object} translation. Row from translation file
 * @returns {object} { data: {object}, reference: {id:string, itemType:string}}
 */
const formatCreateRecord = (record:Record<string,unknown>, translation:TranslationRecord):LinkRecordRef => {
  return {
    data: { ...record },
    meta: { id: translation.id, [DatoFields.ItemType]: translation[DatoFields.ItemType] },
  };
};

/**
 * @desc Split records that should be created from modular blocks into their separate arrays
 * @param {array} records
 * @returns {object} { modularBlocks:array, records: array }
 */
const splitRecordsAndModularBlocks = (records:CreateRecordRef[]):RecordsAndBlocks => {
  const result = records.reduce(
    (acc, record) => {
      if (record.fieldType === DatoFieldTypes.RichText) {
        acc.modularBlocks.push(record);
      } else {
        acc.records.push(record);
      }
      return acc;
    },
    {
      modularBlocks: [],
      records: [],
    } as RecordsAndBlocks,
  );
  return result;
};

/**
 * @desc Flatten and removes duplicates. This is a preparation for the actual create. We want to avoid creating duplicates as the same record can be re-used by other Dato parent records
 * @param {array} records
 * @returns {array}
 */
export const flattenAndDeDuplicate = (records:CreateRecordRef[]):CreateRecordRef[] => {
  // flatten list
  const flattenedList = records.reduce((acc, record) => {
    switch (record.fieldType) {
      case DatoFieldTypes.Link:{
        acc.push(record);
        break;
      }
      case DatoFieldTypes.Links: {
        // links has an array of items
        const items = record.item as LinkRecordRef[];
        const linksResult = items.reduce((innerAcc, item) => {
          innerAcc.push({
            ...record,
            item,
          });
          return innerAcc;
        }, [] as CreateRecordRef[]);
        acc.push(...linksResult);
        break;
      }
    }
    return acc;
  }, [] as CreateRecordRef[]);

  // remove duplicates
  const uniqueList: CreateRecordRef[] = [];

  const reference = new Map();
  for (const record of flattenedList) {
    const item = record.item as LinkRecordRef;
    if (!reference.has(item.meta.id)) {
      reference.set(item.meta.id, true);
      uniqueList.push(record);
    }
  }
  return uniqueList;
};

/**
 * @desc Add newly created record id:s to our reference list that will be used for update later
 * @param {array} createdRecords
 * @param {array} referenceRecords
 * @returns {array}
 */
export const mergeNewRecords = (createdRecords:CreatedRecord[], referenceRecords:CreateRecordRef[]):CreateRecordRef[] => {
  const result = referenceRecords.reduce((acc, reference) => {
    switch (reference.fieldType) {
      case DatoFieldTypes.Link: {
        const referenceItem = reference.item as LinkRecordRef;

        const record = createdRecords.find((x) => {
          const item = x.reference.item as LinkRecordRef;
          if(item.meta.id === referenceItem.meta.id){
            return x;
          }
          return null;
        });

        if (record?.newRecord?.id) {
          const p = {
            ...reference,
            item: {
              ...reference.item,
              data: {
                ...referenceItem.data,
                id: record.newRecord.id,
              },
            },
          };
          acc.push(p);
        }
        break;
      }
      case DatoFieldTypes.Links: {
        const referenceItems = reference.item as LinkRecordRef[];
        const items = referenceItems.reduce((innerAcc, ref) => {

          const record = createdRecords.find((x) => {
            const item = x.reference.item as LinkRecordRef;
            if(item.meta.id === ref.meta.id){
              return x;
            }
            return null;
          });

          if (record?.newRecord?.id) {
            innerAcc.push({
              data: {
                ...ref.data,
                id: record.newRecord.id,
              },
              meta: {
                ...ref.meta,
              },
            });
          }
          return innerAcc;
        }, [] as LinkRecordRef[]);

        if (items?.length > 0) {
          acc.push({
            ...reference,
            item: items,
          });
        }
        break;
      }
    }

    return acc;
  }, [] as CreateRecordRef[]);
  return result;
};

/**
 * @desc Create object used for updating assets
 * @param {object} currentData
 * @param {array} translations
 * @param {string} sourceLang Language we translated from
 * @param {string} targetLang Language we are translating to
 * @return {object}
 */
export const mergeAssetsToUpdate = ( assets:Record<string,unknown>[], translations:TranslationRecord[], sourceLang:string, targetLang :string):UpdateRecordRef[] => {
  const result = translations.reduce((acc, translation) => {
    const currentAsset = assets.find((asset) => asset.id === translation.id);

    if (currentAsset) {
      const objTranslations = objectifyFields(translation.fields as TranslationField[]);

      if (!isObjectEmpty(objTranslations)) {

        // Take existing translations
        const currentAssetMetaData = currentAsset[DatoFields.AssetMetadata] as Record<string,unknown>;
        // Take current meta data values from source lang like "focalPoint" etc and set on the new translation
        const currentAssetMetaDataUntranslatable = currentAssetMetaData[sourceLang] as Record<string,unknown>;

        const data = {
          ...currentAsset,
          [DatoFields.AssetMetadata]: {
            ...currentAssetMetaData,
            [targetLang]: {
              ...currentAssetMetaDataUntranslatable,
              ...objTranslations,
            },
          },
        };

        acc.push({
          id: translation.id,
          data,
        });
      }
    }

    return acc;
  }, [] as UpdateRecordRef[]);

  return result;
};

/**
 * @desc HACK WARNING AHEAD: Stripping too long translation on SEO title and description. Validators can be set everywhere nut SEO has default title:60 and description:160 making way too many updates to fail.
 * @param record
 * @param field
 * @returns
 */
const validateAndStripSEO = (record:Record<string,unknown>, field:Field, logger:Logger):Record<string,unknown> => {

  if(field.fieldType === DatoFieldTypes.Seo){
    const validators = field.validators as SeoValidator;
    const context = "validateAndStripSEO";
      let title = record[DatoFields.SeoTitle] as string;
      let description = record[DatoFields.SeoDescription] as string;
      if(title.length > validators.titleLength.max){
        title = title.slice(0,validators.titleLength.max);
        logger.log({context, type:LogType.Other, status:LogStatus.Warning, description:"Truncated SEO title", item:record});
      }
      if(description.length > validators.descriptionLength.max){
        description = title.slice(0,validators.titleLength.max);
        logger.log({context, type:LogType.Other, status:LogStatus.Warning, description:"Truncated SEO description", item:record});
      }
      return {
        title,
        description
      }
  }
  return record;
}

/**
 * @desc Splits records and assets translations into 2 separate arrays, as they are always used separately
 * This will speed up parsing later as we dont have to spin through non relevant translations
 * @param {object} translationData { lang: "sv", fields: []}
 * @return {object} { records: [...], assets: [...]}
 */
export const splitTranslationTypes = (translationData:TranslationData):TranslationRefs => {
    const fields = translationData.fields as TranslationRecord[];

    return fields.reduce((acc:TranslationRefs, record:TranslationRecord) => {
      if (record[DatoFields.ItemType] === ItemTypes.Media) {
        acc.assets.push(record);
      } else {
        acc.records.push(record);
      }
      return acc;
    }, {
      records:[],
      assets:[]
    } as TranslationRefs)
};
