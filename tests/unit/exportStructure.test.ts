import { TranslationField, Model } from './../../src/types/shared';
import { createField, createSpecialField, createSEOField, createDefaultRecord, constructDefaultAssetRecord } from "../../src/services/structure/export";
import { Fields, DatoFields, ItemTypes } from '../../src/helpers/constants';

describe('export structure', () => {
  describe('createField', () => {
    it('Valid key, value and hint', () => {
      const data = {
        key : "theKey",
        value: "a value",
        hint : "A hint"
      }
      const result = {
        [Fields.Name]: data.key,
        [Fields.Value]: data.value,
        [Fields.Hint]: data.hint
      }

      expect(createField(data)).toEqual(result);
    });
    it('Valid key, value and undefined hint', () => {
      const data = {
        key : "theKey",
        value: "a value",
      }
      const result = {
        [Fields.Name]: data.key,
        [Fields.Value]: data.value,
        [Fields.Hint]: ""
      }

      expect(createField(data)).toEqual(result);
    });
  });
  describe('createSpecialField', () => {
    it('Valid key, value and hint', () => {
      const fields: TranslationField[] = [
        {
          fieldName: "fieldName",
          hint:"",
          value: "A value"
        }
      ];
      const data = {
        key : "theKey",
        hint: "A hint",
        fields
      }
      const result = {
        [Fields.Name]: data.key,
        [Fields.Hint]: data.hint,
        [Fields.Items]: fields
      }
      expect(createSpecialField(data)).toEqual(result);
    });
    it('Valid key, value and undefined hint', () => {
      const fields: TranslationField[] = [
        {
          fieldName: "fieldName",
          hint:"",
          value: ""
        }
      ];
      const data = {
        key : "theKey",
        hint: undefined,
        fields
      }
      const result = {
        [Fields.Name]: data.key,
        [Fields.Hint]: "",
        [Fields.Items]: fields
      }
      expect(createSpecialField(data)).toEqual(result);
    });
  });
  describe('createSEOField', () => {
    it('Valid key, value, hint and title and description values', () => {
      const data = {
        key : "theKey",
        hint: "A hint",
        value: {
          title: "Title text",
          description: "Description text"
        }
      }

      const fields = [
        {
          [Fields.Name]: DatoFields.SeoTitle,
          [Fields.Value]: "Title text",
          [Fields.Hint]: ""
        },
        {
          [Fields.Name]: DatoFields.SeoDescription,
          [Fields.Value]: "Description text",
          [Fields.Hint]: ""
        }
      ];
      const result = {
          [Fields.Name]: "theKey",
          [Fields.Hint]: "A hint",
          [Fields.Items]: fields
        }

      expect(createSEOField(data)).toEqual(result);
    });
    it('Valid key, value, SEO title and no description value', () => {
      const data = {
        key : "theKey",
        hint: "A hint",
        value: {
          title: "Title text",
        }
      }

      const fields = [
        {
          [Fields.Name]: DatoFields.SeoTitle,
          [Fields.Value]: "Title text",
          [Fields.Hint]: ""
        },
      ];
      const result = {
          [Fields.Name]: "theKey",
          [Fields.Hint]: "A hint",
          [Fields.Items]: fields
        }

      expect(createSEOField(data)).toEqual(result);
    });
    it('Valid key, value, no SEO title but description value', () => {
      const data = {
        key : "theKey",
        hint: "A hint",
        value: {
          description: "Description text"
        }
      }

      const fields = [
        {
          [Fields.Name]: DatoFields.SeoDescription,
          [Fields.Value]: "Description text",
          [Fields.Hint]: ""
        }
      ];
      const result = {
          [Fields.Name]: "theKey",
          [Fields.Hint]: "A hint",
          [Fields.Items]: fields
        }

      expect(createSEOField(data)).toEqual(result);
    });
    it('Valid key, value, no SEO title or description should return null', () => {
      const data = {
        key : "theKey",
        hint: "A hint",
        value: {
          title:"",
          description: ""
        }
      }
      expect(createSEOField(data)).toEqual(null);
    });
  });
  describe('createDefaultRecord', () => {
    it('Valid record, model and fields', () => {
      const record : Record<string,unknown> = {
        id: "555",
      };
      const model = {
        id: "333",
        name: "Model name",
        hint: "Model hint"
      }

      const fields :  TranslationField[] = [
        {
          fieldName: "fieldName",
          hint: "A hint",
          value: "A value"
        }
      ];

      const result = {
        id: record.id,
        itemType: model.id,
        modelName: model.name,
        hint: model.hint,
        fields
      }
      expect(createDefaultRecord(record , model as Model, fields)).toEqual(result);
    });
    it('Valid record, model empty fields', () => {
      const record : Record<string,unknown> = {
        id: "555",
      };
      const model = {
        id: "333",
        name: "Model name",
        hint: "Model hint"
      }

      const fields :  TranslationField[] = [];

      const result = {
        id: record.id,
        itemType: model.id,
        modelName: model.name,
        hint: model.hint,
      }
      expect(createDefaultRecord(record , model as Model, fields)).toEqual(result);
    });
  });
  describe('constructDefaultAssetRecord', () => {
    it('Valid record, model and fields', () => {
      const record : Record<string,unknown> = {
        id: "555",
      };

      const fields :  TranslationField[] = [
        {
          fieldName: "fieldName",
          hint: "A hint",
          value: "A value"
        }
      ];

      const result = {
        id: record.id,
        itemType: ItemTypes.Media,
        modelName: "",
        fields
      }
      expect(constructDefaultAssetRecord(record, fields)).toEqual(result);
    });
  });
});
