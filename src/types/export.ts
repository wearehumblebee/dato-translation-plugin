export type ExportSettings = {
  downloadFile: boolean,
  exportOnlyPublishedRecords: boolean,
  exportAssets: boolean,
  exportContent: boolean
}

// TODO models and assets
export type ExportData = {
  records: Record<string,unknown>[],
  assets: Record<string,unknown>[]
}
