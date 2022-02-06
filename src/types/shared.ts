export type Model = {
  id:string;
  name: string;
  singleton: boolean;
  apiKey: string;
  allLocalesRequired: boolean;
  modularBlock : boolean;
  hint: string | null;
  fields: Field[];
  fieldsReference: string[]
}

export type Field = {
  id:string;
  apiKey:string;
  fieldType:string;
  hint:string | null;
  itemType:string;
  label:string;
  localized:boolean;
}

export type ModularBlock = {
    type: string;
    attributes: object,
    relationships: {
      item_type: {
        data: {
          id: string,
          type: string,
        },
      },
    },
};

// Types used in actual export file

export type TranslationData = {
  lang: string;
  fields: TranslationRecord[] // I think
}

export type FieldsArray = Array<TranslationField | TranslationFieldSpecial>;

export type TranslationRecord = {
  id:string;
  itemType:string;
  modelName: string; // TODO should this be name ???
  hint:string;
  fields?: FieldsArray;
}

interface TranslationFieldBase {
  fieldName:string;
  hint:string;
  type?: "reference" | undefined; // have to get rid of this guy
}

export interface TranslationField extends TranslationFieldBase {
  value:unknown;
}

// File (Media) and Seo are special shapes that sits directly on a record
export interface TranslationFieldSpecial extends TranslationFieldBase {
  fields: TranslationField[]
}

export type MediaField = {
  alt: string;
  title: string;
}

export type SeoField = {
  title?:string;
  description?:string;
  image?: object
}
