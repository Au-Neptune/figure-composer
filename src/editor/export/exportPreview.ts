import type { ExportPreset } from "../model/exportPreset";
import type { Size } from "../model/geometry";
import { fitWithin, hasRenderableArea } from "../model/geometry";
import {
  CSS_SCREEN_DPI,
  MIN_EXPORT_DIMENSION,
  MIN_EXPORT_DPI,
} from "../state/editorDefaults";

export interface ExportPreviewMetrics {
  readonly outputSize: Size;
  readonly finalPixelSize: Size;
  readonly previewSize: Size;
  readonly previewScaleX: number;
  readonly previewScaleY: number;
}

export interface ExportPreviewMetricsOptions {
  readonly figureSize: Size;
  readonly preset: ExportPreset;
  readonly maxPreviewSize: Size;
}

export function createExportPreviewMetrics({
  figureSize,
  preset,
  maxPreviewSize,
}: ExportPreviewMetricsOptions): ExportPreviewMetrics {
  assertPositiveSize(figureSize, "Figure Layout");
  assertPositiveSize(maxPreviewSize, "Export Preview bounds");
  const outputSize = createExportOutputSize(preset);
  const previewSize = fitWithin(outputSize, maxPreviewSize);
  return {
    outputSize,
    finalPixelSize: createExportPixelSize(preset),
    previewSize,
    previewScaleX: previewSize.width / figureSize.width,
    previewScaleY: previewSize.height / figureSize.height,
  };
}

export function createExportOutputSize(preset: ExportPreset): Size {
  assertAtLeast(preset.width, "Export width", MIN_EXPORT_DIMENSION);
  assertAtLeast(preset.height, "Export height", MIN_EXPORT_DIMENSION);
  return { width: preset.width, height: preset.height };
}

export function createExportPixelSize(preset: ExportPreset): Size {
  const outputSize = createExportOutputSize(preset);
  assertAtLeast(preset.dpi, "Export DPI", MIN_EXPORT_DPI);
  return {
    width: convertCssPixelsToOutputPixels(outputSize.width, preset.dpi),
    height: convertCssPixelsToOutputPixels(outputSize.height, preset.dpi),
  };
}

function convertCssPixelsToOutputPixels(cssPixels: number, dpi: number): number {
  return Math.round((cssPixels * dpi) / CSS_SCREEN_DPI);
}

function assertPositiveSize(size: Size, label: string): void {
  if (!hasRenderableArea(size)) {
    throw new Error(`${label} must have a positive width and height.`);
  }
}

function assertAtLeast(value: number, label: string, minimum: number): void {
  if (!Number.isFinite(value) || value < minimum) {
    throw new Error(`${label} must be at least ${minimum}.`);
  }
}
