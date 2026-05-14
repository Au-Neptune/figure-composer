import { describe, expect, it } from "vitest";
import type { Figure } from "../model/figure";
import type { ImportedSourceImage } from "../model/sourceImage";
import { createInitialProject, projectReducer } from "../state/projectStore";
import { createProjectJson, hydrateFigure } from "./projectJson";

const IMPORTED_SOURCE_IMAGE: ImportedSourceImage = {
  name: "sample.png",
  assetUrl: "blob:runtime-only",
  width: 320,
  height: 240,
};

describe("projectJson", () => {
  it("omits runtime asset URLs from serialized project JSON", () => {
    const figure = createFigureWithSourceImage();
    const projectJson = createProjectJson(figure);
    const serialized = JSON.stringify(projectJson);

    expect(serialized).not.toContain(IMPORTED_SOURCE_IMAGE.assetUrl);
    expect(projectJson.figure.sourceImages[0]).not.toHaveProperty("assetUrl");
  });

  it("hydrates runtime asset URLs and resets transient editor selection", () => {
    const figure = createFigureWithSourceImage();
    const projectJson = createProjectJson({
      ...figure,
      selectedObjectId: figure.objects[0]?.id ?? null,
      tool: "roi",
    });
    const assetFileName = projectJson.figure.sourceImages[0]?.assetFileName;
    if (!assetFileName) {
      throw new Error("Expected a serialized Source Image asset filename.");
    }
    const hydrated = hydrateFigure(
      projectJson,
      new Map([[assetFileName, "blob:hydrated"]]),
    );

    expect(hydrated.sourceImages[0]?.assetUrl).toBe("blob:hydrated");
    expect(hydrated.selectedObjectId).toBeNull();
    expect(hydrated.selectedRoiId).toBeNull();
    expect(hydrated.tool).toBe("select");
  });
});

function createFigureWithSourceImage(): Figure {
  return projectReducer(createInitialProject(), {
    type: "sourceImageImported",
    imported: IMPORTED_SOURCE_IMAGE,
  });
}
