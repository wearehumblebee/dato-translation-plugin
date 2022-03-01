import { Model,TranslationField,TranslationFieldSpecial,FieldsArray } from '../../types/shared';
import {  TranslationRecord } from "../../types/export";
import { Fields, DatoFields, ItemTypes } from '../../helpers/constants';
import { CreateFieldArgs,CreateSpecialFieldArgs, createSEOFieldArgs } from "../../services/interfaces";

/**
 * @desc Helper to create SEO DatoCMS standard object with { title, description }, disregarding image for now
 * @param {string} key
 * @param {string} value
 * @return {array} -
 */
export const createSEOField = ( {key, value, hint}:createSEOFieldArgs ): TranslationFieldSpecial | null => {
  let result = [];
  if (value?.title) {
    result.push(createField({ key: DatoFields.SeoTitle, value: value.title }));
  }
  if (value?.description) {
    result.push(createField({ key: DatoFields.SeoDescription, value: value.description }));
  }

  return result.length > 0
    ? createSpecialField({ key, hint, fields:result })
    : null;
};

/**
 * @desc Helper to create string | text field. {fieldName: "key", value: "Hello hello"}
 * @param {string} key
 * @param {string} value
 * @param {string} hint Hint from dato about what the field does
 * @return {object} { id: "434344", itemType: "123456", fields: []}
 */
export const createField = ({ key, value, hint }:CreateFieldArgs) :TranslationField => {
  return {
    [Fields.Name]:key,
    [Fields.Value]: value,
    [Fields.Hint]: hint || "",
  }
};

/**
 * @desc Helper to create File (media) or SEO field.
 * @param {string} key
 * @param {string} hint Hint from dato about what the field does
 * @param {array} List of regular TranslationFields
 * @return {object} { id: "434344", itemType: "123456", fields: []}
 */
export const createSpecialField = ({key, hint,fields}:CreateSpecialFieldArgs) : TranslationFieldSpecial => {
  return {
    [Fields.Name]:key,
    [Fields.Hint] : hint || "",
    [Fields.Items]: fields
  }
}

/**
 * @desc Helper function to create a record. id of record, itemType of record, needed when creating a new record on import
 * @param {object} item Dato record
 * @param {object} model Dato model
 * @param {items} Optional init items
 * @return {object} { id: "434344", itemType: "123456", fields: []}
 */
 export const createDefaultRecord = (record:Record<string,unknown>, model:Model, items:FieldsArray):TranslationRecord => {

  const defaultRecord = {
    id: record.id,
    itemType: model.id,
    modelName: model.name,
    hint: model.hint || '',
  } as TranslationRecord

  if(items.length > 0){
    defaultRecord.fields = items;
  }
  return defaultRecord;
};

/**
 * @desc Helper function to create an asset record.
 * @param {object} item Dato record or Dato asset
 * @param {items} Optional init items
 * @return {object} { id: "434344", itemType: "123456", fields: []}
 */
export const constructDefaultAssetRecord = (record:Record<string,unknown>, items:TranslationField[]):TranslationRecord => {
  return {
    id: record.id,
    // Assets dont have itemType (model id), using this to differentiate records from assets
    itemType: ItemTypes.Media,
    modelName: '',
    fields: items && items.length > 0 ? items : [],
  } as TranslationRecord
};
