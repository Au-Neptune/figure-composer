import { describe, expect, it } from "vitest";
import type { Figure, SourceImageObject } from "../model/figure";
import type { ImportedSourceImage } from "../model/sourceImage";
import { createInitialProject, projectReducer } from "./projectStore";
import { getRoiDeleteBlocker } from "./roiCommands";

const IMPORTED_SOURCE_IMAGE: ImportedSourceImage = {
  name: "cells.png",
  assetUrl: "blob:test-cells",
  width: 1000,
  height: 600,
};

describe("ROI commands", () => {
  it("deletes an ROI with its linked inset and source references", () => {
    const figure = createFigureWithLinkedInset();
    const sourceImage = getOnlySourceImage(figure);
    const deleted = projectReducer(figure, {
      type: "roiDeleted",
      roiId: getOnlyRoiId(figure),
    });

    expect(deleted.rois).toHaveLength(0);
    expect(deleted.objects).toHaveLength(1);
    expect(getOnlySourceImage(deleted).referencedBy).toEqual([]);
    expect(deleted.selectedObjectId).toBeNull();
    expect(deleted.selectedRoiId).toBeNull();
    expect(sourceImage.referencedBy).toHaveLength(2);
  });

  it("blocks ROI deletion while a derived source image still references it", () => {
    const figure = createFigureWithDerivedSource();
    const roiId = getOnlyRoiId(figure);

    expect(() =>
      projectReducer(figure, { type: "roiDeleted", roiId }),
    ).toThrow("Cannot delete ROI because Source Image");
  });

  it("blocks ROI deletion while child ROIs use its linked inset", () => {
    const figure = createFigureWithNestedRoi();
    const parentRoiId = getOnlyRoiId(figure);

    expect(getRoiDeleteBlocker(figure, parentRoiId)?.message).toContain(
      "child ROI",
    );
    expect(() =>
      projectReducer(figure, { type: "roiDeleted", roiId: parentRoiId }),
    ).toThrow("Cannot delete ROI because child ROI");
  });
});

function createFigureWithLinkedInset(): Figure {
  const figure = projectReducer(createInitialProject(), {
    type: "sourceImageImported",
    imported: IMPORTED_SOURCE_IMAGE,
  });
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

function createFigureWithDerivedSource(): Figure {
  const figure = createFigureWithLinkedInset();
  const parent = getOnlySourceImage(figure);
  const roi = figure.rois[0];
  if (!roi) {
    throw new Error("Expected an ROI in the test Figure.");
  }
  return {
    ...figure,
    sourceImages: [
      ...figure.sourceImages,
      {
        id: "source_derived",
        name: "cells crop.png",
        assetUrl: "blob:derived-crop",
        assetFileName: "source_derived_cells-crop.png",
        width: 120,
        height: 80,
        referencedBy: [],
        lineage: {
          kind: "derived",
          parentSourceImageId: parent.id,
          operation: { kind: "crop", roiId: roi.id, cropRect: roi.rect },
          roiId: roi.id,
          cropRect: roi.rect,
        },
      },
    ],
  };
}

function createFigureWithNestedRoi(): Figure {
  const figure = createFigureWithLinkedInset();
  const parentInset = getOnlyInset(figure);
  return projectReducer(figure, {
    type: "linkedInsetCreated",
    sourceObjectId: parentInset.id,
    stageRect: {
      x: parentInset.x,
      y: parentInset.y,
      width: parentInset.width / 2,
      height: parentInset.height / 2,
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

function getOnlyRoiId(figure: Figure): string {
  const roi = figure.rois[0];
  if (!roi) {
    throw new Error("Expected an ROI in the test Figure.");
  }
  return roi.id;
}

function getOnlyInset(figure: Figure) {
  const object = figure.objects.find((item) => item.kind === "inset");
  if (!object || object.kind !== "inset") {
    throw new Error("Expected an Inset object in the test Figure.");
  }
  return object;
}
