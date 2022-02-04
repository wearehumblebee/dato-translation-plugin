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

// Ugly merged types

export type TranslationRecord = {
  records: FileRecord[],
  references: string[]
}

// Types used in actual export file

export type FileData = {
  lang: string;
  fields: FileRecord[] // I think
}

interface FileFieldBase {
  fieldName:string;
  hint:string;
  type?: "reference" | undefined; // have to get rid of this guy
}

export interface FileField extends FileFieldBase {
  value:unknown;
}

// TODO remove me
export type FileFieldOLD = {
  fieldName:string;
  value: unknown;
  hint: string | null;
  type?: "reference" | undefined;
  fields?: FileField[];
}

// File (Media) and Seo are special shapes that sits directly on a record
export interface FileFieldSpecial extends FileFieldBase {
  fields: FileField[]
}

export type MediaField = {
  alt: string;
  title: string;
}

export type FieldsArray = Array<FileField | FileFieldSpecial>;

export type FileRecord = {
  id:string;
  itemType:string;
  modelName: string;
  hint:string;
  fields?: FieldsArray;
  //fields:FileField[]
}

export type SeoField = {
  title?:string;
  description?:string;
  image?: object
}
