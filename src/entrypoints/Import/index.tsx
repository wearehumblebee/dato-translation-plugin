import { RenderPagePropertiesAndMethods } from 'datocms-plugin-sdk';
import { useCallback, useMemo, useState } from 'react';
import { SiteClient } from 'datocms-client';
import { ImportSettings, TranslationRefs } from '../../types/import';
import {  TranslationData ,ReferenceData, CustomToast} from "../../types/shared";
import { LogSummary, LogStatus, LogType } from '../../types/logger';
import { fetchDataForExport, fetchFieldsForModels, publishAllRecords } from "../../services/apiService";
import { downloadFile } from '../../helpers/fileHandling';
import { isImportInvalid } from '../../validation/validate';
import { importRecords,importAssets, splitTranslationTypes } from "../../services/importService";
import SummaryTable from "../../components/SummaryTable";
import FileUpload from "../../components/FileUpload";
import Locales from "../../components/Locales";
import LocaleSelector from '../../components/LocaleSelector';
import Logger from "../../helpers/logger";
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

export default function Import({ ctx }: PropTypes) {

  const [settings, setSettings] = useState<ImportSettings>({
    isDryRun: true,
    dontCreateRecords:false,
    createBackupFile:false,
  });
  const defaultLocale = ctx.site.attributes.locales.length > 0 ? ctx.site.attributes.locales[0] : "";
  const [isLoading, setIsLoading] = useState(false);
  const [sourceLocale, setSourceLocale] = useState<string>(defaultLocale);
  const [targetLocale, setTargetLocale] = useState<string>();
  const [summary, setSummary] = useState<LogSummary | undefined>(undefined);

  const [translationFile, setTranslationFile] = useState<TranslationData | undefined>();

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

  const publishAllClick = async() => {
    setIsLoading(true);
    let isError = false;
    let publishedCount = 0;
    try {
      publishedCount = await publishAllRecords(client, settings.isDryRun);
    }catch(error){
      console.error(error);
      isError = true;
    }
    setIsLoading(false);

    if(isError){
      ctx.customToast({
        type:"alert",
        message:"Could not publish records"
      });
    }else{
      ctx.customToast({
        type:"notice",
        message:`${publishedCount} records have been published`
      });
    }
  }

  const downloadHelper = (data:any, fileNamePrefix:string):void => {
    const fileName = `${fileNamePrefix}-${ctx.site.attributes.name}`
    downloadFile(data, fileName);
  };

  const uploadFile = (e:React.ChangeEvent<HTMLInputElement>) => {

    if(e.target.files && e.target.files?.length > 0){
      const reader = new FileReader();

      reader.readAsText(e.target.files[0], 'UTF-8');

      reader.onload = async () => {
        if(reader.result){
          const result = await JSON.parse(reader.result as string);

          const validationError = isImportInvalid(result, sourceLocale, ctx.site.attributes.locales);
          if(!validationError){
            setTranslationFile(result);
            setTargetLocale(result.lang);
          }else{
            ctx.customToast(validationError);
          }

        }else{
          ctx.customToast({
            type:"warning",
            message:"Error parsing the translation file"
          });
        }
      };

      reader.onerror = () => {
        console.log(reader.error);
        ctx.customToast({
          type:"warning",
          message:"Error reading the translation file"
        });
      }
    }
  };

  const fetcReferenceData = async():Promise<ReferenceData> => {
    const data = await fetchDataForExport(client, false, true, true);
    data.models = await fetchFieldsForModels(client, ctx.itemTypes);
    return data;
  }

  const startImport = async(sourceLang:string, targetLang:string, translations:TranslationRefs, logger:Logger) :Promise<CustomToast>=> {

    let data:ReferenceData | undefined = undefined;
    let toast: CustomToast | undefined = undefined;

    try{
      data = await fetcReferenceData();
    }catch(error){
      logger.log({context:"fetcReferenceData",status:LogStatus.Error, type:LogType.Other, error:error as Record<string,unknown>})
      console.error(error);
    }

    if(data && (data.records.length > 0 || data.assets.length > 0) && data.models.length > 0){

      if(settings.createBackupFile){
        // Download current state of content
        downloadHelper(data, "backup")
      }

      await importRecords({client, records: data.records, models:data.models,translations: translations.records, sourceLang,targetLang, isDryRun:settings.isDryRun, dontCreateRecords:settings.dontCreateRecords, logger});
      await importAssets({client, records:data.assets, translations: translations.assets, sourceLang, targetLang, logger, isDryRun:settings.isDryRun});

      toast = {
        type: "notice",
        message: "Import is done"
      };
    }else{
      toast = {
        type: 'alert',
        message:"Could not fetch reference data from DatoCMS, aborting",
      }
    }
    return toast;
  }

  const initImport = async() => {

    setIsLoading(true);

    const file = translationFile as TranslationData;

    // Validating again if user has changed source lang after uploading file
    const validationError = isImportInvalid(file, sourceLocale,ctx.site.attributes.locales)

    if(validationError){
      ctx.customToast(validationError);
      setIsLoading(false);
      return;
    }

    // Take source and target lang from locale
    const sourceLang = sourceLocale;
    const targetLang = targetLocale as string;

    const logger = new Logger(sourceLang, targetLang, Logger.LogMode.Import, settings.isDryRun);

    // file has been validated above
    const translations = splitTranslationTypes(file);

    const toast = await startImport(sourceLang, targetLang, translations,logger);

    setSummary(logger.getLogSummary);

    ctx.customToast(toast);
    setIsLoading(false);

  }

  return (
    <Canvas ctx={ctx}>
        <div>
          <div className={s['layoutMain']}>
            <Toolbar>
              <ToolbarStack stackSize="l">
                <ToolbarTitle>{`Import data`}</ToolbarTitle>
                <div>
                  <Button
                    type="button"
                    buttonType='primary'
                    buttonSize="s"
                    disabled={isLoading}
                    onClick={publishAllClick}
                  >
                  Publish everything
                </Button>
              </div>
              </ToolbarStack>
            </Toolbar>
              <div className={s['layoutSettings']}>
              <SwitchField id="isDryRun" name="isDryRun" label="Dry run" hint="" onChange={updateSettings.bind(null, 'isDryRun')} value={settings.isDryRun} />
                <SwitchField id="dontCreateRecords" name="dontCreateRecords" label="Dont create records" hint="" onChange={updateSettings.bind(null, 'dontCreateRecords')} value={settings.dontCreateRecords} />
                <SwitchField id="createBackupFile" name="createBackupFile" label="Create backup file" hint="" onChange={updateSettings.bind(null, 'createBackupFile')} value={settings.createBackupFile} />
              </div>

              <FileUpload uploadFile={uploadFile} isDisabled={isLoading} label="Upload translation file"/>

              <Locales sourceLocale={sourceLocale} targetLocale={targetLocale} locales={ctx.site.attributes.locales} changeSourceLocale={changeLang} selectedSourceLocale={sourceLocale}/>

              <div className={s['buttonWrapper']}>
                <Button
                  type="button"
                  buttonType='primary'
                  buttonSize="l"
                  disabled={isLoading || !translationFile}
                  onClick={initImport}
                >
                Import data
              </Button>
              </div>

            {isLoading && (
              <div className={s['layoutSpinner']}>
                <Spinner/>
              </div>
            )}

            {summary && !isLoading && (
              <SummaryTable summary={summary} onDownloadClick={downloadHelper}/>
            )}

          </div>
        </div>

    </Canvas>
  );
}
