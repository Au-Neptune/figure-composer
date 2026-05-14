import { describe, expect, it } from "vitest";
import type { Figure, SourceImageObject } from "../model/figure";
import type { ImportedSourceImage } from "../model/sourceImage";
import { createInitialProject, projectReducer } from "./projectStore";

const IMPORTED_SOURCE_IMAGE: ImportedSourceImage = {
  name: "cells.png",
  assetUrl: "blob:test-cells",
  width: 1000,
  height: 600,
};

describe("projectReducer", () => {
  it("adds an imported source image and selects its canvas object", () => {
    const figure = createFigureWithSourceImage();
    const sourceImage = getOnlySourceImage(figure);
    const sourceObject = getOnlySourceObject(figure);

    expect(sourceImage).toMatchObject({
      name: IMPORTED_SOURCE_IMAGE.name,
      assetUrl: IMPORTED_SOURCE_IMAGE.assetUrl,
      width: IMPORTED_SOURCE_IMAGE.width,
      height: IMPORTED_SOURCE_IMAGE.height,
      referencedBy: [],
    });
    expect(sourceObject.sourceImageId).toBe(sourceImage?.id);
    expect(figure.selectedObjectId).toBe(sourceObject.id);
    expect(figure.tool).toBe("select");
  });

  it("renames a source image without changing object references", () => {
    const figure = createFigureWithSourceImage();
    const sourceImage = getOnlySourceImage(figure);
    const sourceObject = getOnlySourceObject(figure);
    const renamed = projectReducer(figure, {
      type: "sourceImageRenamed",
      sourceImageId: sourceImage.id,
      name: "  renamed-cells.tif  ",
    });

    expect(getOnlySourceImage(renamed).name).toBe("renamed-cells.tif");
    expect(getOnlySourceObject(renamed)).toMatchObject({
      id: sourceObject.id,
      sourceImageId: sourceImage.id,
    });
  });

  it("rejects an empty source image rename", () => {
    const figure = createFigureWithSourceImage();
    const sourceImage = getOnlySourceImage(figure);

    expect(() =>
      projectReducer(figure, {
        type: "sourceImageRenamed",
        sourceImageId: sourceImage.id,
        name: "   ",
      }),
    ).toThrow("Source Image name cannot be empty.");
  });

  it("deletes an unreferenced source image and its canvas object", () => {
    const figure = createFigureWithSourceImage();
    const sourceImage = getOnlySourceImage(figure);
    const deleted = projectReducer(figure, {
      type: "sourceImageDeleted",
      sourceImageId: sourceImage.id,
    });

    expect(deleted.sourceImages).toHaveLength(0);
    expect(deleted.objects).toHaveLength(0);
    expect(deleted.selectedObjectId).toBeNull();
  });

  it("blocks deletion when a source image is referenced by ROI or inset data", () => {
    const figure = createFigureWithLinkedInset();
    const sourceImage = getOnlySourceImage(figure);

    expect(() =>
      projectReducer(figure, {
        type: "sourceImageDeleted",
        sourceImageId: sourceImage.id,
      }),
    ).toThrow(`Cannot delete Source Image "${sourceImage.name}"`);
  });

  it("adds a derived source image without mutating its parent source", () => {
    const figure = createFigureWithLinkedInset();
    const parent = getOnlySourceImage(figure);
    const roi = getOnlyRoi(figure);
    const updated = projectReducer(figure, {
      type: "derivedSourceImageCreated",
      derived: {
        name: "cells crop.png",
        assetUrl: "blob:derived-crop",
        width: 120,
        height: 80,
        lineage: {
          kind: "derived",
          parentSourceImageId: parent.id,
          roiId: roi.id,
          cropRect: roi.rect,
        },
      },
    });
    const derived = updated.sourceImages.find((item) => item.id !== parent.id);
    const derivedObject = updated.objects.find(
      (item) => item.kind === "sourceImage" && item.sourceImageId === derived?.id,
    );

    expect(updated.sourceImages[0]).toEqual(parent);
    expect(derived?.lineage).toEqual({
      kind: "derived",
      parentSourceImageId: parent.id,
      roiId: roi.id,
      cropRect: roi.rect,
    });
    expect(derivedObject?.id).toBe(updated.selectedObjectId);
  });

  it("updates export output size without changing Figure Layout", () => {
    const figure = createInitialProject();
    const preset = getOnlyExportPreset(figure);
    const updated = projectReducer(figure, {
      type: "exportPresetChanged",
      presetId: preset.id,
      patch: { width: 640, height: 480 },
    });

    expect(updated.canvas).toEqual(figure.canvas);
    expect(getOnlyExportPreset(updated)).toMatchObject({
      width: 640,
      height: 480,
    });
  });

  it("updates Figure Layout without changing export output size", () => {
    const figure = createInitialProject();
    const preset = getOnlyExportPreset(figure);
    const updated = projectReducer(figure, {
      type: "canvasSettingsChanged",
      patch: { width: 900, height: 700 },
    });

    expect(updated.canvas).toMatchObject({ width: 900, height: 700 });
    expect(getOnlyExportPreset(updated)).toMatchObject({
      width: preset.width,
      height: preset.height,
    });
  });

  it("keeps moved and resized objects inside the figure canvas", () => {
    const figure = createFigureWithSourceImage();
    const sourceObject = getOnlySourceObject(figure);
    const moved = projectReducer(figure, {
      type: "figureObjectMoved",
      objectId: sourceObject.id,
      x: -120,
      y: -80,
    });
    const resized = projectReducer(moved, {
      type: "figureObjectResized",
      objectId: sourceObject.id,
      bounds: { x: 900, y: 700, width: 800, height: 500 },
    });
    const object = getOnlySourceObject(resized);

    expect(getOnlySourceObject(moved)).toMatchObject({ x: 0, y: 0 });
    expect(object.x + object.width).toBeLessThanOrEqual(resized.canvas.width);
    expect(object.y + object.height).toBeLessThanOrEqual(resized.canvas.height);
  });

  it("creates a linked inset from a clamped region of interest", () => {
    const figure = createFigureWithSourceImage();
    const sourceObject = getOnlySourceObject(figure);
    const nextFigure = projectReducer(figure, {
      type: "linkedInsetCreated",
      sourceObjectId: sourceObject.id,
      stageRect: {
        x: sourceObject.x - 40,
        y: sourceObject.y - 30,
        width: 260,
        height: 180,
      },
    });
    const roi = nextFigure.rois[0];
    const inset = nextFigure.objects.find((object) => object.kind === "inset");

    expect(roi?.sourceObjectId).toBe(sourceObject.id);
    expect(roi?.rect.x).toBe(0);
    expect(roi?.rect.y).toBe(0);
    expect(roi?.rect.width).toBeGreaterThan(0);
    expect(roi?.rect.height).toBeGreaterThan(0);
    expect(inset?.sourceImageId).toBe(roi?.sourceImageId);
    expect(nextFigure.selectedObjectId).toBe(inset?.id);
  });

  it("throws when a requested source object does not exist", () => {
    const figure = createInitialProject();

    expect(() =>
      projectReducer(figure, {
        type: "linkedInsetCreated",
        sourceObjectId: "object_missing",
        stageRect: { x: 0, y: 0, width: 100, height: 100 },
      }),
    ).toThrow("Figure object not found");
  });
});

function createFigureWithSourceImage(): Figure {
  return projectReducer(createInitialProject(), {
    type: "sourceImageImported",
    imported: IMPORTED_SOURCE_IMAGE,
  });
}

function createFigureWithLinkedInset(): Figure {
  const figure = createFigureWithSourceImage();
  const sourceObject = getOnlySourceObject(figure);
  return projectReducer(figure, {
    type: "linkedInsetCreated",
    sourceObjectId: sourceObject.id,
    stageRect: {
      x: sourceObject.x,
      y: sourceObject.y,
      width: 120,
      height: 80,
    },
  });
}

function getOnlySourceImage(figure: Figure) {
  const sourceImage = figure.sourceImages[0];
  if (!sourceImage) {
    throw new Error("Expected a Source Image in the test Figure.");
  }
  return sourceImage;
}

function getOnlySourceObject(figure: Figure): SourceImageObject {
  const object = figure.objects.find((item) => item.kind === "sourceImage");
  if (!object || object.kind !== "sourceImage") {
    throw new Error("Expected a Source Image object in the test Figure.");
  }
  return object;
}

function getOnlyRoi(figure: Figure) {
  const roi = figure.rois[0];
  if (!roi) {
    throw new Error("Expected a ROI in the test Figure.");
  }
  return roi;
}

function getOnlyExportPreset(figure: Figure) {
  const preset = figure.exportPresets[0];
  if (!preset) {
    throw new Error("Expected an Export Preset in the test Figure.");
  }
  return preset;
}
