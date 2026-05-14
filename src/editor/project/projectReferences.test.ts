import { describe, expect, it } from "vitest";
import type { Figure } from "../model/figure";
import type { ImportedSourceImage } from "../model/sourceImage";
import { createInitialProject, projectReducer } from "../state/projectStore";
import type { ProjectJson } from "./projectJson";
import { createProjectJson } from "./projectJson";
import { parseProjectJsonText } from "./projectJsonValidation";

const IMPORTED_SOURCE_IMAGE: ImportedSourceImage = {
  name: "sample.png",
  assetUrl: "blob:runtime-only",
  width: 320,
  height: 240,
};

describe("project reference validation", () => {
  it("rejects Figure objects that reference missing Source Images", () => {
    expect(() =>
      parseMutatedProjectJson((projectJson) => ({
        ...projectJson,
        figure: {
          ...projectJson.figure,
          objects: projectJson.figure.objects.map((object) => ({
            ...object,
            sourceImageId: "source_missing",
          })),
        },
      })),
    ).toThrow("Figure object");
  });

  it("rejects ROIs that reference missing Source Image objects", () => {
    expect(() =>
      parseMutatedProjectJson((projectJson) => ({
        ...projectJson,
        figure: {
          ...projectJson.figure,
          rois: projectJson.figure.rois.map((roi) => ({
            ...roi,
            sourceObjectId: "object_missing",
          })),
        },
      })),
    ).toThrow("references missing Source Image object");
  });

  it("rejects Insets that reference missing ROIs", () => {
    expect(() =>
      parseMutatedProjectJson((projectJson) => ({
        ...projectJson,
        figure: {
          ...projectJson.figure,
          objects: projectJson.figure.objects.map((object) =>
            object.kind === "inset" ? { ...object, roiId: "roi_missing" } : object,
          ),
        },
      })),
    ).toThrow("references missing ROI");
  });

  it("rejects stale Source Image referencedBy links", () => {
    expect(() =>
      parseMutatedProjectJson((projectJson) => ({
        ...projectJson,
        figure: {
          ...projectJson.figure,
          sourceImages: projectJson.figure.sourceImages.map((sourceImage) => ({
            ...sourceImage,
            referencedBy: ["reference_missing"],
          })),
        },
      })),
    ).toThrow("references missing item");
  });
});

function parseMutatedProjectJson(
  mutate: (projectJson: ProjectJson) => ProjectJson,
): void {
  const projectJson = createProjectJson(createFigureWithLinkedInset());
  parseProjectJsonText(JSON.stringify(mutate(projectJson)));
}

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

function getOnlySourceObject(figure: Figure) {
  const object = figure.objects.find((item) => item.kind === "sourceImage");
  if (!object || object.kind !== "sourceImage") {
    throw new Error("Expected a Source Image object in the test Figure.");
  }
  return object;
}
