import type { ExportPreset } from "../model/exportPreset";
import type { CanvasSettings } from "../model/figure";

export function syncExportPresetToCanvas(
  preset: ExportPreset,
  canvas: CanvasSettings,
): ExportPreset {
  return {
    ...preset,
    width: canvas.width,
    height: canvas.height,
  };
}
