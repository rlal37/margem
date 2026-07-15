/** Exportação: PNG, Markdown e .margem (seção 14.2). */
export { buildMarkdown } from './markdownExport'
export {
  buildMargemJson,
  parseMargemJson,
  exportMargem,
  importMargem,
} from './margemFile'
export type { MargemImportResult } from './margemFile'
export { exportPng } from './pngExport'
export { triggerDownload, defaultBaseName, safeFileName } from './download'
export { ExportDialog } from './ExportDialog'
