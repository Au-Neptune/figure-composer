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

describe("selected component deletion", () => {
  it("deletes a selected generic annotation", () => {
    const figure = projectReducer(createInitialProject(), {
      type: "genericAnnotationAdded",
    });
    const deleted = projectReducer(figure, { type: "selectedComponentDeleted" });

    expect(deleted.objects).toHaveLength(0);
    expect(deleted.selectedObjectId).toBeNull();
    expect(deleted.selectedRoiId).toBeNull();
  });

  it("deletes a selected inset through its linked ROI", () => {
    const figure = createFigureWithLinkedInset();
    const deleted = projectReducer(figure, { type: "selectedComponentDeleted" });

    expect(deleted.rois).toHaveLength(0);
    expect(deleted.objects).toHaveLength(1);
    expect(deleted.sourceImages[0]?.referencedBy).toEqual([]);
  });

  it("deletes a selected ROI frame with its linked inset", () => {
    const figure = createFigureWithLinkedInset();
    const roi = getOnlyRoi(figure);
    const selected = projectReducer(figure, {
      type: "roiFrameSelected",
      roiId: roi.id,
    });
    const deleted = projectReducer(selected, { type: "selectedComponentDeleted" });

    expect(deleted.rois).toHaveLength(0);
    expect(deleted.objects).toHaveLength(1);
    expect(deleted.selectedRoiId).toBeNull();
  });

  it("blocks selected Source Image deletion when it has references", () => {
    const figure = createFigureWithLinkedInset();
    const sourceObject = getOnlySourceObject(figure);
    const selected = projectReducer(figure, {
      type: "figureObjectSelected",
      objectId: sourceObject.id,
    });

    expect(() =>
      projectReducer(selected, { type: "selectedComponentDeleted" }),
    ).toThrow("Cannot delete Source Image");
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

function getOnlySourceObject(figure: Figure): SourceImageObject {
  const object = figure.objects.find((item) => item.kind === "sourceImage");
  if (!object || object.kind !== "sourceImage") {
    throw new Error("Expected a Source Image object.");
  }
  return object;
}

function getOnlyRoi(figure: Figure) {
  const roi = figure.rois[0];
  if (!roi) {
    throw new Error("Expected an ROI.");
  }
  return roi;
}
