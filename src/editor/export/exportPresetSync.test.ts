import { describe, expect, it } from "vitest";
import type { ExportPreset } from "../model/exportPreset";
import { syncExportPresetToCanvas } from "./exportPresetSync";

const EXPORT_PRESET: ExportPreset = {
  id: "preset_test",
  name: "Publication PNG",
  width: 640,
  height: 480,
  dpi: 300,
  format: "png",
  background: "#ffffff",
  jpgQuality: 0.92,
};

describe("syncExportPresetToCanvas", () => {
  it("matches export output dimensions to the current canvas", () => {
    const synced = syncExportPresetToCanvas(EXPORT_PRESET, {
      width: 1200,
      height: 800,
      background: "#f8faf7",
    });

    expect(synced).toMatchObject({ width: 1200, height: 800 });
    expect(synced.dpi).toBe(EXPORT_PRESET.dpi);
    expect(EXPORT_PRESET).toMatchObject({ width: 640, height: 480 });
  });
});
