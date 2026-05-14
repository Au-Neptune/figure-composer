import type Konva from "konva";
import type { ExportPreset } from "../model/exportPreset";
import type { Size } from "../model/geometry";
import { runWithoutEditorChrome } from "./exportEditorChrome";
import { applyExportDpiMetadata } from "./exportMetadata";
import { createExportPixelSize } from "./exportPreview";

const PNG_MIME_TYPE = "image/png";
const JPG_MIME_TYPE = "image/jpeg";
const CANVAS_ORIGIN = 0;

interface ExportFigureOptions {
  readonly fileBasename: string;
  readonly preset: ExportPreset;
}

export function exportStageAsFigure(
  stage: Konva.Stage,
  options: ExportFigureOptions,
): void {
  runWithoutEditorChrome(stage, () => exportVisibleStage(stage, options));
}

function exportVisibleStage(stage: Konva.Stage, options: ExportFigureOptions): void {
  const outputSize = createExportPixelSize(options.preset);
  const stageCanvas = stage.toCanvas({
    pixelRatio: createExportStagePixelRatio(stage, outputSize),
  });
  const outputCanvas = createScaledOutputCanvas(stageCanvas, outputSize);
  const dataUrl = applyExportDpiMetadata(
    outputCanvas.toDataURL(getMimeType(options.preset), options.preset.jpgQuality),
    options.preset,
  );
  downloadDataUrl(dataUrl, createFileName(options));
}

function getMimeType(preset: ExportPreset): string {
  return preset.format === "jpg" ? JPG_MIME_TYPE : PNG_MIME_TYPE;
}

function createFileName(options: ExportFigureOptions): string {
  return `${options.fileBasename}.${options.preset.format}`;
}

function createExportStagePixelRatio(stage: Konva.Stage, outputSize: Size): number {
  return Math.max(outputSize.width / stage.width(), outputSize.height / stage.height());
}

function createScaledOutputCanvas(
  stageCanvas: HTMLCanvasElement,
  outputSize: Size,
): HTMLCanvasElement {
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = outputSize.width;
  outputCanvas.height = outputSize.height;
  const context = outputCanvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context is required to export Figure.");
  }
  context.drawImage(
    stageCanvas,
    CANVAS_ORIGIN,
    CANVAS_ORIGIN,
    outputSize.width,
    outputSize.height,
  );
  return outputCanvas;
}

function downloadDataUrl(dataUrl: string, fileName: string): void {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = fileName;
  anchor.click();
}
