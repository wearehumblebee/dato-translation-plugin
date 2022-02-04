import { RenderPagePropertiesAndMethods } from 'datocms-plugin-sdk';
import { useCallback, useMemo, useState } from 'react';
import { SiteClient } from 'datocms-client';
import { ExportSettings, ExportData } from '../../types/export';
import { FileData, Model, FileRecord } from "../../types/shared";
import { fetchDataForExport, fetchFieldsForModels } from "../../services/apiService";
import { parseRecords, parseAssets,formatFileResult } from "../../services/exportService";
import { createJSONBlob } from '../../helpers/downloadFile';
import { isExportFileValid } from '../../validation/export';
import s from './styles.module.css';
import {
  Canvas,
  Toolbar,
  ToolbarStack,
  ToolbarTitle,
  Dropdown,
  DropdownOption,
  DropdownMenu,
  CaretUpIcon,
  CaretDownIcon,
  SwitchField,
  Spinner,
  Button,
} from 'datocms-react-ui';

type PropTypes = {
  ctx: RenderPagePropertiesAndMethods;
};

export default function Export({ ctx }: PropTypes) {

  const [settings, setSettings] = useState<ExportSettings>({
    downloadFile:false,
    exportOnlyPublishedRecords: false,
    exportAssets: false,
    exportContent: true
  });
  const defaultLocale = ctx.site.attributes.locales.length > 0 ? ctx.site.attributes.locales[0] : "";
  const [isLoading, setIsLoading] = useState(false);
  const [locale, setLocale] = useState(defaultLocale);

  const client = useMemo(
    () =>
      new SiteClient(ctx.currentUserAccessToken, {
        environment: ctx.environment,
      }),
    [ctx.currentUserAccessToken, ctx.environment],
  );

  const updateSettings = useCallback(
    (field: string, value: boolean) => {
      const newSettings = {...settings, [field]: value};
      setSettings(newSettings);
    },
    [settings, setSettings],
  );

  const changeLang = useCallback(
    (locale: string) => {
      setLocale(locale);
    },
    [],
  );

  const downloadFile = (blob:Blob, fileName:string):void => {
    const dataUri = URL.createObjectURL(blob);

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    linkElement.click();
  };

  const createAndDownloadFile = (data:FileData):void => {

    const fileIsValid = isExportFileValid(data);



    if(fileIsValid){
      try{
        const jsonObj = createJSONBlob(data);
        downloadFile(jsonObj, `export - ${ctx.site.attributes.name}.json`);
      }catch(err){
        console.error(err);
        ctx.customToast({
          type: 'alert',
          message:"JSON file could not be created",
        });
      }

    }else{
      ctx.customToast({
        type: 'warning',
        message:"Export data is empty",
      });
    }

  }

  const runExport = async() => {

    let data:ExportData  = {
      records: [],
      assets: []
    }
    let models:Model[] = [];

    setIsLoading(true);

    try{
      data = await fetchDataForExport(client, settings);
      models = await fetchFieldsForModels(client, ctx.itemTypes);
    }catch(err){
      console.error(err);
    }

    if(data && (data.records.length > 0 || data.assets.length > 0) && models.length > 0){

      let assets : FileRecord[] = [];

      const records = parseRecords(data.records, models,locale );

      if(settings.exportAssets){
        assets = parseAssets(data.assets, locale);
      }

      const result = formatFileResult(records, assets, locale);

      if(settings.downloadFile){
        createAndDownloadFile(result);
      }
      ctx.notice(`${result.fields.length} records have been exported from language: ${result.lang}`)
    }else{
      ctx.customToast({
        type: 'warning',
        message:"Could not fetch reference data from DatoCMS, aborting",
      });
    }
    setIsLoading(false);

  }

  return (
    <Canvas ctx={ctx}>
        <div>
          <div className={s['layoutMain']}>
            <Toolbar>
              <ToolbarStack stackSize="l">
                <ToolbarTitle>{`Export data (${locale})`}</ToolbarTitle>
                <Dropdown
                renderTrigger={({ open, onClick }) => (
                  <Button
                    onClick={onClick}
                    rightIcon={open ? <CaretUpIcon /> : <CaretDownIcon />}
                  >
                    Select locale
                    </Button>
                )}
              >
                <DropdownMenu>
                  {ctx.site.attributes.locales.map((locale, i) => {
                    return (
                      <DropdownOption key={`locale-option-${i}`} onClick={() => changeLang(locale)}>{locale}</DropdownOption>
                    )
                  })}
                </DropdownMenu>
              </Dropdown>
              </ToolbarStack>
            </Toolbar>

              <div className={s['layoutSettings']}>
                <SwitchField id="downloadFile" name="downloadFile" label="Download export file" hint="" onChange={updateSettings.bind(null, 'downloadFile')} value={settings.downloadFile} />
                <SwitchField id="exportContent" name="exportContent" label="Export content" hint="" onChange={updateSettings.bind(null, 'exportContent')} value={settings.exportContent} />
                <SwitchField id="exportAssets" name="exportAssets" label="Export assets" hint="" onChange={updateSettings.bind(null, 'exportAssets')} value={settings.exportAssets} />
                <SwitchField id="exportOnlyPublishedRecords" name="exportOnlyPublishedRecords" label="Export only published" hint="" onChange={updateSettings.bind(null, 'exportOnlyPublishedRecords')} value={settings.exportOnlyPublishedRecords} />
              </div>

              <Button
                type="button"
                fullWidth
                buttonSize="xxs"
                disabled={isLoading}
                onClick={runExport}
              >
              Run export
            </Button>

            {isLoading && (
              <div className={s['layoutSpinner']}>
                <Spinner/>
              </div>
            )}

          </div>
        </div>

    </Canvas>
  );
}
