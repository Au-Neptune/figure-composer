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
    const sourceImage = figure.sourceImages[0];
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

function getOnlySourceObject(figure: Figure): SourceImageObject {
  const object = figure.objects.find((item) => item.kind === "sourceImage");
  if (!object || object.kind !== "sourceImage") {
    throw new Error("Expected a Source Image object in the test Figure.");
  }
  return object;
}
