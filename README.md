# DatoCMS Translator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Adds two new tabs in DatoCMS in the top menu bar "Export" and "Import"

This plugin is build using the [DatoCMS plugin-sdk](https://www.datocms.com/docs/plugin-sdk)

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

After the export file has been translated, all the value fields should have new translation and all other fields HAVE to untouched. Secondly the language tag at the root of the file must be changed to the language (target language) of the values in the file. This lang have to exist in Dato before import. If not an error message will popup and tell you the language doesn´t exist in Dato.

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

Assets are only interesting of you have global translations on your assets (files and images under the Media section in DatoCMS). This concerns alt and title translations. If no translations exist on assets they will not be exported and import will not be affected, the toggle is mostly there for optimizing export/import runtime.

### Export only published

Select if only published content should be exported or not.

### Source language

Select the language to use in export file. The plugin will default to first locale in current setup.

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

- Translatable linked records / linked records list having translatable fields on them are not supported. This seems like a setup to avoid anyway.

- Structured text fields. Not supported ATM

- Color, Location, Date, JSON fields, Boolean, Number are not touched or as they are not translatable values and are not included in the export file. Future iterations might copy/merge data from these fields from source language when running import but it is not available ATM unless these fields sit on a modular block.

- Modular blocks merge values from source language that are not sent to export as this is the only way to create them if the fields are mandatory. The benefit of this is that images etc are copied from source language which probably is what we want anyway.

- A translatable modular blocks field with no fields valid for translation will not be copied/merged during import. If the block has for example an image and a boolean this modular block will not be present in the translation file and hence not be created during import. If however the block has an image, boolean and a text field the entire modular block will be created in the new locale during import.

- When importing SEO fields untranslatable values will automatically be copied/merged from source language. This mainly concerns the image if one exist in source language.

- SEO fields by default has length validation on title and description. This has caused a lot of update failures when testing with real translations. To solve this the values are ruthlessly truncated to validators max length. The truncation is logged as a warning.

- Translatable links in a tree structure will create the records but not connect the tree structure ATM.

- String fields starting with a link (either external or internal) will be omitted from the export result.

- String fields with validation setting "Accept only specified values" displayed as a dropdown in DatoCMS will be omitted from the export result. Translating this value will more than likely fail the import of a record with such a field.

## License

[MIT](https://choosealicense.com/licenses/mit/)

Copyright (c) 2022 Humblebee AB

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
