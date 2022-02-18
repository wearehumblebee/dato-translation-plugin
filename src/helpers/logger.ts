import { Log, LogItem, LogMode, LogType, LogStatus, LogSummary} from "../types/logger";
import { parseError } from "../helpers/errorHandling";

interface LogParams {
  context:string,
  item?:Record<string,unknown>,
  type:LogType,
  status:LogStatus,
  error?:unknown,
  description?:string;
}

/**
 * @desc Pseudo logger. Creating a log.json file
 */
class Logger {

  current:Log;

  static readonly LogMode = LogMode;

  constructor(sourceLang:string, targetLang:string, logMode:LogMode, isDryRun:boolean) {

    this.current = {
      sourceLang,
      targetLang,
      date: new Date().toISOString(),
      isDryRun: isDryRun,
      mode: logMode,
      items: [],
    };
  }

  get getLogSummary(): LogSummary {
    const init = {
      ok: 0,
      error:0
    };

    const summary :LogSummary = {
      sourceLang:this.current.sourceLang,
      targetLang:this.current.targetLang,
      date:this.current.date,
      isDryRun:this.current.isDryRun,
      create: {...init},
      update: {...init},
      updateAsset:{...init},
      errors: [],
      warnings: []
    }

    return this.current.items.reduce((acc, item) => {
      switch(item.status){
        case LogStatus.Ok:{
          switch(item.type){
            case LogType.Create: {
              acc.create.ok++;
              break;
            }
            case LogType.Update: {
              acc.update.ok++;
              break;
            }
            case LogType.UpdateAsset: {
              acc.updateAsset.ok++;
              break;
            }
          }
          break;
        }
        case LogStatus.Error: {
          switch(item.type){
            case LogType.Create: {
              acc.create.error++;
              break;
            }
            case LogType.Update: {
              acc.update.error++;
              break;
            }
            case LogType.UpdateAsset: {
              acc.updateAsset.error++;
              break;
            }
          }
          // Add detailed errors
          acc.errors.push(item);
          break;
        }
        case LogStatus.Warning: {
          acc.warnings.push(item);
          break;
        }
      }
      return acc;
    }, summary as LogSummary);
  }

  log({context, item, type, status, error, description}:LogParams) {

    let logItem :LogItem = {
      context,
      status,
      type,
      description
    }

    if(status !== LogStatus.Ok){
        if(error){
          logItem.error = {
            reason: parseError(error),
            item : item || {}
          }
        }else{
          logItem.error = {
            item : item || {}
          }
        }
    }
    this.current.items.push(logItem);
  }
}

export default Logger;
