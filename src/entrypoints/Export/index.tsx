import { RenderPagePropertiesAndMethods } from 'datocms-plugin-sdk';
import { useCallback, useMemo, useState } from 'react';
import { SiteClient } from 'datocms-client';
import { ExportSettings ,TranslationRecord, ExportSummary} from '../../types/export';
import { TranslationData, Model, ReferenceData} from "../../types/shared";
import { fetchDataForExport, fetchFieldsForModels } from "../../services/apiService";
import { parseRecords, parseAssets,formatFileResult } from "../../services/exportService";
import { downloadFile } from '../../helpers/fileHandling';
import { isExportFileValid } from '../../validation/validate';
import Locales from "../../components/Locales";
import LocaleSelector from '../../components/LocaleSelector';
import ExportSummaryTable from '../../components/ExportSummaryTable';
import s from './styles.module.css';
import {
  Canvas,
  Toolbar,
  ToolbarStack,
  ToolbarTitle,
  SwitchField,
  Spinner,
  Button,
} from 'datocms-react-ui';

type PropTypes = {
  ctx: RenderPagePropertiesAndMethods;
};

export default function Export({ ctx }: PropTypes) {

  const [settings, setSettings] = useState<ExportSettings>({
    exportOnlyPublishedRecords: false,
    exportAssets: true,
    exportContent: true
  });
  const defaultLocale = ctx.site.attributes.locales.length > 0 ? ctx.site.attributes.locales[0] : "";
  const [isLoading, setIsLoading] = useState(false);
  const [sourceLocale, setSourceLocale] = useState(defaultLocale);
  const [summary, setSummary] = useState<ExportSummary | undefined>(undefined);

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
      setSourceLocale(locale);
    },
    [],
  );

  const createAndDownloadFile = (data:TranslationData):void => {

    const fileIsValid = isExportFileValid(data);

    if(fileIsValid){
      try{
        downloadFile(data, `export-${ctx.site.attributes.name}`);
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

    let data:ReferenceData  = {
      records: [],
      assets: [],
      models: []
    }
    let models:Model[] = [];

    setSummary(undefined);
    setIsLoading(true);

    try{
      data = await fetchDataForExport(client,settings.exportOnlyPublishedRecords, settings.exportContent, settings.exportAssets);
      models = await fetchFieldsForModels(client, ctx.itemTypes);
    }catch(err){
      console.error(err);
    }

    if(data && (data.records.length > 0 || data.assets.length > 0) && models.length > 0){

      let assets : TranslationRecord[] = [];

      const records = parseRecords(data.records, models,sourceLocale );

      if(settings.exportAssets){
        assets = parseAssets(data.assets, sourceLocale);
      }

      const result = formatFileResult(records, assets, sourceLocale);

      setSummary({
        file: result,
        recordsCount: records.length,
        assetsCount: assets.length
      });

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
                <ToolbarTitle>{`Export data`}</ToolbarTitle>
              </ToolbarStack>
            </Toolbar>

              <div className={s['layoutSettings']}>
                <SwitchField id="exportContent" name="exportContent" label="Export content" hint="" onChange={updateSettings.bind(null, 'exportContent')} value={settings.exportContent} />
                <SwitchField id="exportAssets" name="exportAssets" label="Export assets" hint="" onChange={updateSettings.bind(null, 'exportAssets')} value={settings.exportAssets} />
                <SwitchField id="exportOnlyPublishedRecords" name="exportOnlyPublishedRecords" label="Export only published" hint="" onChange={updateSettings.bind(null, 'exportOnlyPublishedRecords')} value={settings.exportOnlyPublishedRecords} />
                <LocaleSelector locales={ctx.site.attributes.locales} changeLocale={changeLang} label="Select source language" keyPrefix='source-locale' selectedLocale={sourceLocale}/>
              </div>
              <Locales sourceLocale={sourceLocale} locales={ctx.site.attributes.locales} changeSourceLocale={changeLang} selectedSourceLocale={sourceLocale}/>

              <div className={s['buttonWrapper']}>
                <Button
                  type="button"
                  buttonType='primary'
                  buttonSize="l"
                  disabled={isLoading}
                  onClick={runExport}
                >
                Run export
              </Button>
              </div>

            {isLoading && (
              <div className={s['layoutSpinner']}>
                <Spinner/>
              </div>
            )}

            {!isLoading && summary && (
              <ExportSummaryTable summary={summary} onDownloadClick={createAndDownloadFile}/>
            )}

          </div>
        </div>

    </Canvas>
  );
}
