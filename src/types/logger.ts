export type Log = {
  sourceLang:string;
  targetLang:string;
  date:string;
  isDryRun:boolean;
  mode:LogMode;
  items: LogItem[];
}

export type LogItem = {
  context: string;
  status: LogStatus;
  type: LogType;
  error?: {
    reason?: LogError
    item: Record<string,unknown>
  };
  description?:string;
}

type SummaryValue = {
  ok: number;
  error:number;
}

export type LogSummary = {
  create: SummaryValue;
  update: SummaryValue;
  updateAsset:SummaryValue;
  errors: LogItem[];
  warnings: LogItem[];
  sourceLang:string;
  targetLang:string;
  date:string;
  isDryRun:boolean;
}

export enum LogMode {
  Import= "import",
  Export= "export"
}

export enum LogType {
  Create="create",
  Update="update",
  UpdateAsset="update asset",
  CreateModel = "create model",
  Other="other"
}

export enum LogStatus {
  Ok="ok",
  Error="error",
  Warning="warning"
}

export type LogError = {
  name: string;
  message: string;
  statusCode?: number;
  statusText?:string;
}
