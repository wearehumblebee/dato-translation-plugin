import { isNumericString, isObjectEmpty,objectifyFields, buildModularBlockHelper } from "../../src/helpers/parseHelper";
import { TranslationField } from "../../src/types/shared";

describe('parseHelper', () => {
  describe('isNumericString', () => {
    it('param with valid numeric string', () => {
      const value = '31233';
      expect(isNumericString(value)).toEqual(true);
    });
    it('param with regular string', () => {
      const value = 'Hello 444';
      expect(isNumericString(value)).toEqual(false);
    });
    it('param with empty string', () => {
      const value = '';
      expect(isNumericString(value)).toEqual(false);
    });
    it('param null', () => {
      const value = null;
      expect(isNumericString(value as any)).toEqual(false);
    });
  });
  describe('isObjectEmpty', () => {
    it('Empty object {} === true', () => {
      const value = {};
      expect(isObjectEmpty(value)).toEqual(true);
    });
    it('Object with one non empty string property === false', () => {
      const value = {name:"bosse"};
      expect(isObjectEmpty(value)).toEqual(false);
    });
    it('Object with one empty string property === false', () => {
      const value = {name:""};
      expect(isObjectEmpty(value)).toEqual(false);
    });
    it('Undefined object === true', () => {
      const value = undefined;
      expect(isObjectEmpty(value)).toEqual(true);
    });
  });
  describe('objectifyFields', () => {
    it('1 fields array', () => {
      const values : TranslationField[] = [
        {
          fieldName: "fieldName",
          value: "stuff",
          hint: ""
        },
      ]
      expect(objectifyFields(values)).toEqual({
        fieldName:"stuff",
      });
    });
    it('2 fields array with string and number', () => {
      const values : TranslationField[] = [
        {
          fieldName: "fieldName",
          value: "stuff",
          hint: ""
        },
        {
          fieldName: "fieldName2",
          value: 44,
          hint: ""
        }
      ]
      expect(objectifyFields(values)).toEqual({
        fieldName:"stuff",
        fieldName2:44
      });
    });
    it('Empty fields array should return null', () => {
      const values : TranslationField[] = []
      expect(objectifyFields(values)).toEqual(null);
    });
    it('Undefined fields should return null', () => {
      const values = undefined;
      expect(objectifyFields(values as any)).toEqual(null);
    });
  });
  describe('buildModularBlockHelper', () => {

    let result = {
      type: 'item',
      attributes: {},
      relationships: {
        item_type: {
          data: {
            id: "",
            type: 'item_type',
          },
        },
      },
    };
    it('data obj with 2 fields and valid modelId', () => {
      const data = {
        fieldName: "fieldName",
        value: "stuff",
      };
      result.attributes = data;
      result.relationships.item_type.data.id = "666";

      expect(buildModularBlockHelper(data, "666")).toEqual(result);
    });
    it('data obj with 2 fields and empty modelId should return null', () => {
      const data = {
        fieldName: "fieldName",
        value: "stuff",
      };
      expect(buildModularBlockHelper(data, "")).toEqual(null);
    });
    it('data obj with 2 fields and omitted modelId should return null', () => {
      const data = {
        fieldName: "fieldName",
        value: "stuff",
      };
      expect(buildModularBlockHelper(data, undefined as any)).toEqual(null);
    });
    it('Undefined data object with valid modelId should return null', () => {
      const data = undefined;
      expect(buildModularBlockHelper(data as any, "666")).toEqual(null);
    });
  });
});
