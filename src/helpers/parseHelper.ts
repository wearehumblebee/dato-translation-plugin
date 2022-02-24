import { HistoryRecord, HISTORY_VERSION } from './constants';
import { TranslationField,ModularBlock, Field, StringValidator } from '../types/shared';

/**
 * @desc Check if value string is numeric
 * @param {string} value
 * @return {boolean}
 */
export const isNumericString = (value:string):boolean => {
  // Have to regex to not match dates to int as parseInt("2020-20-20") to 2020, damn you js
  return /^-?\d+$/.test(value);
};

/**
 * @desc Checks in object is null | undefined | {}
 * @param {object*} obj
 * @returns {boolean}
 */
export const isObjectEmpty = (obj:object | Record<string,unknown> | null | undefined):boolean => {
  if (!obj) {
    return true;
  }
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * @desc Takes standard "Fields" array [{fieldName: "keyName", value: "A value"}, ...] and return object
 * @param {array} fields
 * @returns {object | null} {keyName: "A value"}
 */
export const objectifyFields = (fields:TranslationField[]):Record<string,unknown> | null => {
  if (!fields) {
    return null;
  }
  return fields.reduce((acc, curr) => {
    acc[curr.fieldName] = curr.value;
    return acc;
  }, {} as Record<string,unknown>);
};


/**
 * @desc Helper function to create modular blocks as of now I cant use DatoCMS "buildModularBlock" helper which is supposed to do the same thing
 * @param {object} data, Content of the modular block e.g { title: "Hello", description: "The greeting"}
 * @param {object} model , Dato model fields used are id (itemType) and apiKey
 * @returns {object}
 */
export const buildModularBlockHelper = (data:object, modelId:string):ModularBlock => {
  return {
    type: 'item',
    attributes: data,
    relationships: {
      item_type: {
        data: {
          id: modelId,
          type: 'item_type',
        },
      },
    },
  };
};

/**
 * @desc Transforms big log object to much smaller log history object for saving in Dato
 * @param {object} log
 * @return {object}
 */
export const transformLogToHistory = (log:any) => {
  let result = null;
  if (log) {
    result = {
      [HistoryRecord.Version]: HISTORY_VERSION,
      [HistoryRecord.Date]: log.date,
      [HistoryRecord.TargetLang]: log.targetLang,
      [HistoryRecord.SucessTotal]: log.successTotal,
      [HistoryRecord.FailTotal]: log.failTotal,
      [HistoryRecord.CreateRecords]: {
        [HistoryRecord.Success]: log.createRecord.success,
        [HistoryRecord.Fail]: log.createRecord.fail,
      },
      [HistoryRecord.UpdateRecords]: {
        [HistoryRecord.Success]: log.updateRecord.success,
        [HistoryRecord.Fail]: log.updateRecord.fail,
      },
      [HistoryRecord.UpdateAsset]: {
        [HistoryRecord.Success]: log.updateAsset.success,
        [HistoryRecord.Fail]: log.updateAsset.fail,
      },
    };
  }
  return result;
};
