import { TranslationRecord as ExportRecord,  } from "./export";
import { TranslationRecord as ImportRecord } from "./import";

/**
 * @desc Reference Data directly from DatoCMS
 */
export type ReferenceData = {
  records: Record<string,unknown>[],
  assets: Record<string,unknown>[],
  models: Model[]

}

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

export type SeoValidator = {
  titleLength: {
    max:number
  };
  descriptionLength: {
    max:number
  }
}

export type StringValidator = {
  enum?: {
    values: string[]
  }
}

export type Field = {
  id:string;
  apiKey:string;
  fieldType:string;
  hint:string | null;
  itemType:string;
  label:string;
  localized:boolean;
  // More validators could be used in the future
  validators: StringValidator | SeoValidator;
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
  fields: ExportRecord[] | ImportRecord[]
}

export type FieldsArray = Array<TranslationField | TranslationFieldSpecial>;

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

export type CustomToast = {
  type : "notice" | "warning" | "alert";
  message:string;
}
