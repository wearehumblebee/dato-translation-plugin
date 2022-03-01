import { TranslationData, Field, StringValidator } from './../../src/types/shared';
import { isExportFileValid, isImportInvalid, isStringFieldTranslatable } from "../../src/validation/validate";
import { TranslationRecord as ImportRecord } from "../../src/types/import";
import { TranslationRecord as ExportRecord } from "../../src/types/export";

describe('validate', () => {
  describe('isExportFileValid', () => {
    it('Valid file with lang and one record', () => {
      const records: ExportRecord[] = [
        {
          id:"555",
          itemType:"666",
          modelName:"A model",
          hint:"",
          fields: [{
            fieldName:"name",
            value: "bosse",
            hint:"",
          }]
        }
      ];
      const data:TranslationData = {
        lang: "en-GB",
        fields: records
      }
      expect(isExportFileValid(data)).toEqual(true);
    });
    it('File with lang and no records === false', () => {
      const data:TranslationData = {
        lang: "en-GB",
        fields: []
      }
      expect(isExportFileValid(data)).toEqual(false);
    });
    it('File with empty lang one records === false', () => {
      const records: ExportRecord[] = [
        {
          id:"555",
          itemType:"666",
          modelName:"A model",
          hint:"",
          fields: [{
            fieldName:"name",
            value: "bosse",
            hint:"",
          }]
        }
      ];
      const data:TranslationData = {
        lang: "",
        fields: records
      }
      expect(isExportFileValid(data)).toEqual(false);
    });
  });
  describe('isImportInvalid', () => {
    it('Valid file with valid sourceLang target lang and one record', () => {
      const records: ImportRecord[] = [
        {
          id:"555",
          itemType:"666",
          modelName:"A model",
          hint:"",
          fields: [{
            fieldName:"name",
            value: "bosse",
            hint:"",
          }]
        }
      ];
      const data:TranslationData = {
        lang: "en-GB",
        fields: records
      }
      const sourceLang = "en-US";
      const locales = ["en-US", "en-GB"];
      expect(isImportInvalid(data, sourceLang, locales)).toEqual(null);
    });
    it('Undefined file with valid sourceLang and locales should return alert error', () => {
      const data = undefined;

      const sourceLang = "en-US";
      const locales = ["en-US", "en-GB"];
      expect(isImportInvalid(data as any, sourceLang, locales)).toEqual(
        expect.objectContaining({
          type: "alert"
        })
      );
    });
    it('File with empty target language should return alert error', () => {
      const records: ImportRecord[] = [
        {
          id:"555",
          itemType:"666",
          modelName:"A model",
          hint:"",
          fields: [{
            fieldName:"name",
            value: "bosse",
            hint:"",
          }]
        }
      ];
      const data:TranslationData = {
        lang: "",
        fields: records
      }
      const sourceLang = "en-US";
      const locales = ["en-US", "en-GB"];
      expect(isImportInvalid(data as any, sourceLang, locales)).toEqual(
        expect.objectContaining({
          type: "alert"
        })
      );
    });
    it('File with the same source language and target language should return alert error', () => {
      const data:TranslationData = {
        lang: "en-US",
        fields: []
      }
      const sourceLang = "en-US";
      const locales = ["en-US", "en-GB"];
      expect(isImportInvalid(data as any, sourceLang, locales)).toEqual(
        expect.objectContaining({
          type: "alert"
        })
      );
    });
    it('File with a empty records should return alert error', () => {
      const data:TranslationData = {
        lang: "no-NO",
        fields: []
      }
      const sourceLang = "en-US";
      const locales = ["en-US", "en-GB"];
      expect(isImportInvalid(data as any, sourceLang, locales)).toEqual(
        expect.objectContaining({
          type: "alert"
        })
      );
    });
    it('File with a target language not available in locales should return warning error', () => {
      const records: ImportRecord[] = [
        {
          id:"555",
          itemType:"666",
          modelName:"A model",
          hint:"",
          fields: [{
            fieldName:"name",
            value: "bosse",
            hint:"",
          }]
        }
      ];
      const data:TranslationData = {
        lang: "no-NO",
        fields: records
      }
      const sourceLang = "en-US";
      const locales = ["en-US", "en-GB"];
      expect(isImportInvalid(data as any, sourceLang, locales)).toEqual(
        expect.objectContaining({
          type: "warning"
        })
      );
    });
  });

  describe('isStringFieldTranslatable', () => {
    it('Valid string value "A name" === true', () => {
      const field: Field = {
        id:"555",
        apiKey:"field_key",
        fieldType:"string",
        itemType:"",
        label:"label",
        localized:true,
        hint:"",
        validators:{}
      }
      const value = "A name";
      expect(isStringFieldTranslatable(field, value)).toEqual(true);
    });
    it('External url as value === false', () => {
      const field: Field = {
        id:"555",
        apiKey:"field_key",
        fieldType:"string",
        itemType:"",
        label:"label",
        localized:true,
        hint:"",
        validators:{}
      }
      const value = "https://www.google.com";
      expect(isStringFieldTranslatable(field, value)).toEqual(false);
    });
    it('Internal url as value === false', () => {
      const field: Field = {
        id:"555",
        apiKey:"field_key",
        fieldType:"string",
        itemType:"",
        label:"label",
        localized:true,
        hint:"",
        validators:{}
      }
      const value = "/products/detail/kewl-clogs";
      expect(isStringFieldTranslatable(field, value)).toEqual(false);
    });
    it('Valid string value but validator requires specific values that makes string not translatable', () => {
      const field: Field = {
        id:"555",
        apiKey:"field_key",
        fieldType:"string",
        itemType:"",
        label:"label",
        localized:true,
        hint:"",
        validators:{
          enum : {
            values: ["A selection", "Another selection"]
          }
        }
      }
      const value = "A selection";
      expect(isStringFieldTranslatable(field, value)).toEqual(false);
    });
  });
});
