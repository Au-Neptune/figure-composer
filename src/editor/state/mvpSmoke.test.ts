import { describe, expect, it } from "vitest";
import { createExportPreviewMetrics } from "../export/exportPreview";
import type { ExportPreset } from "../model/exportPreset";
import type { Figure, InsetObject, SourceImageObject } from "../model/figure";
import type { ImportedSourceImage } from "../model/sourceImage";
import { createProjectJson, hydrateFigure } from "../project/projectJson";
import { parseProjectJsonText } from "../project/projectJsonValidation";
import {
  canRedo,
  canUndo,
  createInitialHistory,
  historyReducer,
  type HistoryAction,
  type HistoryState,
} from "./historyStore";

const IMPORTED_SOURCE_IMAGE: ImportedSourceImage = {
  name: "mvp-cells.png",
  assetUrl: "blob:mvp-cells",
  width: 1000,
  height: 600,
};

const EXPORT_PREVIEW_BOUNDS = { width: 320, height: 220 };

describe("MVP smoke workflow", () => {
  it("covers import ROI inset dock save reopen export settings undo and redo", () => {
    let history = createInitialHistory();
    history = reduce(history, {
      type: "sourceImageImported",
      imported: IMPORTED_SOURCE_IMAGE,
    });
    const sourceObject = getOnlySourceObject(history.present);
    history = reduce(history, {
      type: "linkedInsetCreated",
      sourceObjectId: sourceObject.id,
      stageRect: createRoiStageRect(sourceObject),
    });
    const inset = getOnlyInset(history.present);
    history = reduce(history, {
      type: "insetDocked",
      objectId: inset.id,
      side: "right",
    });
    const reopened = reopenThroughProjectJson(history.present);
    history = reduce(history, { type: "projectOpened", figure: reopened });
    const pngPreset = getOnlyExportPreset(history.present);
    const pngMetrics = createExportPreviewMetrics({
      figureSize: history.present.canvas,
      preset: pngPreset,
      maxPreviewSize: EXPORT_PREVIEW_BOUNDS,
    });
    history = reduce(history, {
      type: "exportPresetChanged",
      presetId: pngPreset.id,
      patch: { format: "jpg", width: 640, height: 480 },
    });
    const jpgPreset = getOnlyExportPreset(history.present);
    const undone = reduce(history, { type: "undoRequested" });
    const redone = reduce(undone, { type: "redoRequested" });

    expect(reopened.rois).toHaveLength(1);
    expect(getOnlyInset(reopened).sourceImageId).toBe(reopened.rois[0]?.sourceImageId);
    expect(pngPreset.format).toBe("png");
    expect(pngMetrics.finalPixelSize.width).toBeGreaterThan(0);
    expect(jpgPreset).toMatchObject({ format: "jpg", width: 640, height: 480 });
    expect(canUndo(history)).toBe(true);
    expect(getOnlyExportPreset(undone.present).format).toBe("png");
    expect(canRedo(undone)).toBe(true);
    expect(getOnlyExportPreset(redone.present).format).toBe("jpg");
  });
});

function reduce(state: HistoryState, action: HistoryAction): HistoryState {
  return historyReducer(state, action);
}

function createRoiStageRect(sourceObject: SourceImageObject) {
  return {
    x: sourceObject.x,
    y: sourceObject.y,
    width: 220,
    height: 160,
  };
}

function reopenThroughProjectJson(figure: Figure): Figure {
  const projectJson = createProjectJson(figure);
  const parsed = parseProjectJsonText(JSON.stringify(projectJson));
  return hydrateFigure(parsed, createAssetUrlMap(projectJson.figure.sourceImages));
}

function createAssetUrlMap(
  sourceImages: readonly { readonly assetFileName: string; readonly id: string }[],
): ReadonlyMap<string, string> {
  return new Map(
    sourceImages.map((sourceImage) => [
      sourceImage.assetFileName,
      `blob:${sourceImage.id}`,
    ]),
  );
}

function getOnlySourceObject(figure: Figure): SourceImageObject {
  const object = figure.objects.find((item) => item.kind === "sourceImage");
  if (!object || object.kind !== "sourceImage") {
    throw new Error("Expected a Source Image object in the smoke Figure.");
  }
  return object;
}

function getOnlyInset(figure: Figure): InsetObject {
  const object = figure.objects.find((item) => item.kind === "inset");
  if (!object || object.kind !== "inset") {
    throw new Error("Expected an Inset object in the smoke Figure.");
  }
  return object;
}

function getOnlyExportPreset(figure: Figure): ExportPreset {
  const preset = figure.exportPresets[0];
  if (!preset) {
    throw new Error("Expected an Export Preset in the smoke Figure.");
  }
  return preset;
}
