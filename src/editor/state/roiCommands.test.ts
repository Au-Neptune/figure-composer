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
  return projectReducer(figure, {
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
