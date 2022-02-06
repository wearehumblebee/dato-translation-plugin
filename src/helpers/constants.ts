// TODO Cleanup unused props

/**
 * @readonly
 * @desc Enum for setting error status in pages
 * @enum {number}
 */
 export enum StatusCodes {
  Default= 0,
  Ok= 1,
  Error= 2,
};

/**
 * @desc Dato Content management API rate limit is 60 calls / 3 seconds
 */
export enum ApiRate {
  Limit= 10,
  CoolDown= 3000, // milliseconds
};

export enum DatoFieldTypes {
  String= 'string',
  Text= 'text',
  Integer= 'integer',
  Float= 'float',
  RichText= 'rich_text', // modular blocks, also structured field???
  Link= 'link', // link to other record
  Links= 'links', // array of links to other records
  Seo= 'seo',
  File= 'file',
  Image= 'image',
  TwitterCard= 'twitterCard',
};

/**
 * @readonly
 * @enum {string}
 * @desc Single source of truth for field names used both by export and import.
 * The file that comes out as a result of export uses these field names
 */
export enum Fields {
  Name= 'fieldName',
  Value= 'value',
  Hint='hint',
  ItemType= 'itemType', // model itemType (id of model rather than content model)
  Items= 'fields',
  Lang= 'lang', // used as an global indicator of original language
};

/**
 * @readonly
 * @enum {string}
 * @desc Single source of truth for field names coming from DatoCMS. Naming is not optional
 */
export enum DatoFields {
  Creator= 'creator',
  // media object properties
  MediaAlt= 'alt', // record
  MediaTitle= 'title', // record
  // SEO object properties
  SeoTitle= 'title',
  SeoDescription= 'description',
  AssetMetadata= 'defaultFieldMetadata',
  AllLocalesRequired= 'allLocalesRequired',
  ItemType="itemType"
};

/**
 * @readonly
 * @enum {string}
 * @desc This is only used on assets at the moment. Assets dont have itemType="43423".
 * Flagging this helps us separating incoming translations only with assets since its a
 * separate Dato API call
 */
export enum ItemTypes {
  Media= 'media'
};

/**
 * @readonly
 * @enum {string}
 * @desc Creating model in Dato to hold import history data
 */
export enum HistoryModel {
  Name= 'Import history',
  ApiKey= 'import_history',
  FieldLabel= 'History data',
  FieldApiKey= 'history',
  FieldHint= 'Do not edit manually, used by automatic bulk translation',
};

/**
 * @readonly
 * @enum {string}
 * @desc Creating record in Dato to hold import history data
 */
export enum HistoryRecord {
  Version= 'version',
  Date= 'date',
  TargetLang= 'targetLang',
  SucessTotal= 'successTotal',
  FailTotal= 'failTotal',
  CreateRecords= 'createRecord',
  UpdateRecords= 'updateRecord',
  UpdateAsset= 'updateAsset',
  Success= 'success',
  Fail= 'fail',
};

/**
 * @readonly
 * @desc Version of the export format allows for future changes
 */
export const HISTORY_VERSION = '1.0';
