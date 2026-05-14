import type Konva from "konva";
import type { ExportPreset } from "../model/exportPreset";
import { CSS_SCREEN_DPI } from "../state/editorDefaults";

const PNG_MIME_TYPE = "image/png";
const JPG_MIME_TYPE = "image/jpeg";

interface ExportFigureOptions {
  readonly fileBasename: string;
  readonly preset: ExportPreset;
}

export function exportStageAsFigure(
  stage: Konva.Stage,
  options: ExportFigureOptions,
): void {
  const dataUrl = stage.toDataURL({
    mimeType: getMimeType(options.preset),
    pixelRatio: options.preset.dpi / CSS_SCREEN_DPI,
    quality: options.preset.jpgQuality,
  });
  downloadDataUrl(dataUrl, createFileName(options));
}

function getMimeType(preset: ExportPreset): string {
  return preset.format === "jpg" ? JPG_MIME_TYPE : PNG_MIME_TYPE;
}

function createFileName(options: ExportFigureOptions): string {
  return `${options.fileBasename}.${options.preset.format}`;
}

function downloadDataUrl(dataUrl: string, fileName: string): void {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = fileName;
  anchor.click();
}

