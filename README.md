# DatoCMS Translator

Adds two new tabs in DatoCMS in the top menu bar "Export" and "Import"

This plugin is build using the DatoCMS plugin-sdk
https://www.datocms.com/docs/plugin-sdk

## Features

- Select source language and export all content in that language from DatoCMS into a .json file
- Import translated export file to DatoCMS

## Usage

First export a translation file from the export tab. REMEMBER what source language was used as the SAME source language must be used when importing the translated file.
If import has errors make sure to "Download the entire log" containing the actual errors that happened. This button can be found in the bottom left corner of the summary table.

## File format

Example data from an export file with source language "en-US":

```sh
{
  "lang":"en-US",
  "fields": [
    "id":"4434234",
    "itemType": "133423",
    "name":"Name of model",
    "hint":"A hint about the model",
    "fields": [
      {
        "fieldName": "firstFieldsName",
        "value": "The fields actual content",
        "hint": "Field for users first name"
      },
      {
        "fieldName": "secondFieldsName",
        "value": "Second fields actual content",
        "hint": "Field for users second name"
      },
    ]
  ]
}
```

After the export file has been translated, the lang field should have all value fields translated + the language of the file in the root lang tag (sv-SE in this case)

```sh
{
  "lang":"sv-SE",
  "fields": [
    "id":"4434234",
    "itemType": "133423",
    "name":"Name of model",
    "hint":"A hint about the model",
    "fields": [
      {
        "fieldName": "firstFieldsName",
        "value": "Fältets översättning",
        "hint": "Field for users first name"
      },
      {
        "fieldName": "secondFieldsName",
        "value": "Andra fältets översättning",
        "hint": "Field for users second name"
      },
    ]
  ]
}
```

## Export page

In the settings section at the top of the page there are 3 options

- Export content
- Export assets
- Export only published

### Export content

This is default behavior as content is this case means regular records.

### Export Assets

Assets are only interesting of you have global translations on your assets (files and images under the Media section in DatoCMS). This concerns alt and title translations

### Export only published

Select if only published content should be exported or not.

### Source language

Select the language to use in export file. Plugin will default to first locale in current setup.

## Import page

In the settings section at the top of the page there are 3 options

- Dry run
- Dont create records
- Create backup file

### Dry run

When "Dry run" mode is active no updates or creates will be called to DatoCMS. However a summary of what will happen when the actual import is run will be presented.

- How many records that will be created
- How many records will be updated
- How many assets will be updated

### Dont create records

Most translations will simply add a tranlation to an existing record however Links marked as translatable will create a new record in DatoCMS. Most of the time Dont create records should be deactivated, this option exists mainly if something goes wrong in the first import you may not want to create another batch of dangling records. The regular update functionality can be run over and over since content is only added to existing records.

### Create backup file

Downloads a .json file with the existing state of all data in all languages before import starts.

### Source and target language

Source language HAVE TO BE the same source language that was used when creating the export file. Target language is picked up from the lang tag in the translation file. Target language is the locale where the new translations will be saved in DatoCMS during import.

## Supported / Not supported

- Translatable linked records / linked records list having translatable fields on them. This seems like something that shouldn´t be done anyway.

- Structured text fields. Not supported ATM

- Color, Location, Date, JSON fields, Boolean, Number are not touched or as they are not translatable values and are not included in the export file. An idea would be to copy/merge data from these fields from source language when running import but it is not available today.

- Modular blocks merge values from source language that are not sent to export as this is the only way to create them if the fields are mandatory. The benefit of this is that images etc are copied from source language which probably is what we want anyway.

- A translatable modular blocks field with no fields valid for translation will not be copied/merged during import. If the block has for example an image and a boolean this modular block will not be present in the translation file and hence not be created during import. If however the block has an image, boolean and a text field the entire modular block will be created in the new locale during import.

- SEO fields automatically copies/merges image from source language as this is not sent to translation.

- SEO fields by default has length validation on title and description. This has caused a lot of update failures when testing with real translations so right now the values are ruthlessly truncated to validators max length. The truncation is logged as a warning.

- Translatable links in a tree structure will create the records but not connect the tree structure ATM.
