import { describe, expect, it } from "vitest";
import type { Figure } from "../model/figure";
import type { ImportedSourceImage } from "../model/sourceImage";
import { createInitialProject, projectReducer } from "./projectStore";

const IMPORTED_SOURCE_IMAGE: ImportedSourceImage = {
  name: "cells.png",
  assetUrl: "blob:test-cells",
  width: 1000,
  height: 600,
};

describe("partial SDD command coverage", () => {
  it("adds a generic annotation as a movable figure object", () => {
    const figure = projectReducer(createInitialProject(), {
      type: "genericAnnotationAdded",
    });
    const annotation = figure.objects.find(
      (object) => object.kind === "genericAnnotation",
    );

    expect(annotation).toMatchObject({
      kind: "genericAnnotation",
      text: "Annotation",
      fill: "#263126",
      fontSize: 18,
    });
    expect(figure.selectedObjectId).toBe(annotation?.id);
  });

  it("rejects ROI creation from a generic annotation", () => {
    const figure = projectReducer(createInitialProject(), {
      type: "genericAnnotationAdded",
    });
    const annotation = figure.objects.find(
      (object) => object.kind === "genericAnnotation",
    );
    if (!annotation) {
      throw new Error("Expected a Generic Annotation.");
    }

    expect(() =>
      projectReducer(figure, {
        type: "linkedInsetCreated",
        sourceObjectId: annotation.id,
        stageRect: annotation,
      }),
    ).toThrow("Region Of Interest requires a Source Image or Inset object.");
  });

  it("updates generic annotation text", () => {
    const figure = projectReducer(createInitialProject(), {
      type: "genericAnnotationAdded",
    });
    const annotation = figure.objects.find(
      (object) => object.kind === "genericAnnotation",
    );
    if (!annotation) {
      throw new Error("Expected a Generic Annotation.");
    }
    const updated = projectReducer(figure, {
      type: "genericAnnotationTextChanged",
      objectId: annotation.id,
      text: "Scale detail",
    });

    expect(updated.objects.find((object) => object.id === annotation.id)).toMatchObject({
      text: "Scale detail",
    });
  });

  it("adds a derived source image from an explicit image operation", () => {
    const figure = createFigureWithSourceImage();
    const sourceImage = figure.sourceImages[0];
    if (!sourceImage) {
      throw new Error("Expected a Source Image.");
    }
    const nextFigure = projectReducer(figure, {
      type: "derivedSourceImageCreated",
      derived: {
        name: "cells resize.png",
        assetUrl: "blob:cells-resize",
        width: 500,
        height: 300,
        parentSourceImageId: sourceImage.id,
        operation: {
          kind: "resize",
          sourceSize: sourceImage,
          outputSize: { width: 500, height: 300 },
        },
      },
    });
    const derived = nextFigure.sourceImages[1];

    expect(derived).toMatchObject({
      name: "cells resize.png",
      width: 500,
      height: 300,
      lineage: {
        kind: "derived",
        parentSourceImageId: sourceImage.id,
        operation: { kind: "resize" },
      },
    });
    expect(nextFigure.objects).toHaveLength(2);
  });
});

function createFigureWithSourceImage(): Figure {
  return projectReducer(createInitialProject(), {
    type: "sourceImageImported",
    imported: IMPORTED_SOURCE_IMAGE,
  });
}
