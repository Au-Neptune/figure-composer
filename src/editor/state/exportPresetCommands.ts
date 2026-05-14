import type { ExportPreset, ExportPresetPatch } from "../model/exportPreset";
import type { Figure } from "../model/figure";
import {
  MAX_JPG_QUALITY,
  MIN_EXPORT_DIMENSION,
  MIN_EXPORT_DPI,
  MIN_JPG_QUALITY,
} from "./editorDefaults";

interface UpdateExportPresetOptions {
  readonly presetId: string;
  readonly patch: ExportPresetPatch;
}

export function updateExportPreset(
  figure: Figure,
  options: UpdateExportPresetOptions,
): Figure {
  const preset = findExportPreset(figure, options.presetId);
  const nextPreset = validateExportPreset({ ...preset, ...options.patch });
  return {
    ...figure,
    canvas: {
      width: nextPreset.width,
      height: nextPreset.height,
      background: nextPreset.background,
    },
    exportPresets: figure.exportPresets.map((item) =>
      item.id === options.presetId ? nextPreset : item,
    ),
  };
}

function findExportPreset(figure: Figure, presetId: string): ExportPreset {
  const preset = figure.exportPresets.find((item) => item.id === presetId);
  if (!preset) {
    throw new Error(`Export Preset not found: ${presetId}`);
  }
  return preset;
}

function validateExportPreset(preset: ExportPreset): ExportPreset {
  assertPositiveNumber(preset.width, "Export width", MIN_EXPORT_DIMENSION);
  assertPositiveNumber(preset.height, "Export height", MIN_EXPORT_DIMENSION);
  assertPositiveNumber(preset.dpi, "Export DPI", MIN_EXPORT_DPI);
  assertJpgQuality(preset.jpgQuality);
  return preset;
}

function assertPositiveNumber(value: number, label: string, min: number): void {
  if (!Number.isFinite(value) || value < min) {
    throw new Error(`${label} must be at least ${min}.`);
  }
}

function assertJpgQuality(value: number): void {
  if (!Number.isFinite(value) || value < MIN_JPG_QUALITY || value > MAX_JPG_QUALITY) {
    throw new Error(
      `JPG quality must be between ${MIN_JPG_QUALITY} and ${MAX_JPG_QUALITY}.`,
    );
  }
}

