import { describe, expect, it } from "vitest";
import type { ExportPreset } from "../model/exportPreset";
import {
  createExportPixelSize,
  createExportPreviewMetrics,
} from "./exportPreview";

const PRESET: ExportPreset = {
  id: "preset_test",
  name: "PNG 300 DPI",
  width: 1200,
  height: 800,
  dpi: 300,
  format: "png",
  background: "#ffffff",
  jpgQuality: 0.92,
};

const FIGURE_SIZE = { width: 1200, height: 800 };
const WIDE_PREVIEW_BOUNDS = { width: 300, height: 180 };
const SQUARE_PREVIEW_BOUNDS = { width: 300, height: 300 };

describe("export preview metrics", () => {
  it("calculates final pixel size from output size and DPI", () => {
    const pixelSize = createExportPixelSize({
      ...PRESET,
      width: 640,
      height: 480,
      dpi: 192,
    });

    expect(pixelSize).toEqual({ width: 1280, height: 960 });
  });

  it("fits the preview size inside the available preview bounds", () => {
    const metrics = createExportPreviewMetrics({
      figureSize: FIGURE_SIZE,
      preset: PRESET,
      maxPreviewSize: WIDE_PREVIEW_BOUNDS,
    });

    expect(metrics.previewSize).toEqual({ width: 270, height: 180 });
    expect(metrics.previewScaleX).toBe(0.225);
    expect(metrics.previewScaleY).toBe(0.225);
  });

  it("keeps output dimensions independent from Figure Layout dimensions", () => {
    const metrics = createExportPreviewMetrics({
      figureSize: FIGURE_SIZE,
      preset: { ...PRESET, width: 600, height: 400 },
      maxPreviewSize: SQUARE_PREVIEW_BOUNDS,
    });

    expect(metrics.outputSize).toEqual({ width: 600, height: 400 });
    expect(metrics.finalPixelSize).toEqual({ width: 1875, height: 1250 });
    expect(metrics.previewScaleX).toBe(0.25);
    expect(metrics.previewScaleY).toBe(0.25);
  });

  it("throws when export dimensions cannot render", () => {
    expect(() =>
      createExportPixelSize({ ...PRESET, width: 0 }),
    ).toThrow("Export width must be at least 1.");
  });
});
