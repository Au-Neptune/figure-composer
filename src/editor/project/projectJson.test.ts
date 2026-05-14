import { describe, expect, it } from "vitest";
import type { Figure } from "../model/figure";
import type { ImportedSourceImage } from "../model/sourceImage";
import { createInitialProject, projectReducer } from "../state/projectStore";
import { createProjectJson, hydrateFigure } from "./projectJson";
import { parseProjectJsonText } from "./projectJsonValidation";

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
    expect(projectJson.figure.sourceImages[0]?.lineage).toEqual({
      kind: "imported",
    });
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

  it("parses legacy source images without lineage as imported sources", () => {
    const figure = createFigureWithSourceImage();
    const projectJson = createProjectJson(figure);
    const sourceImage = projectJson.figure.sourceImages[0];
    if (!sourceImage) {
      throw new Error("Expected a serialized Source Image.");
    }
    const legacyProjectJson = {
      ...projectJson,
      figure: {
        ...projectJson.figure,
        sourceImages: [createLegacySourceImage(sourceImage)],
      },
    };
    const parsed = parseProjectJsonText(JSON.stringify(legacyProjectJson));

    expect(parsed.figure.sourceImages[0]?.lineage).toEqual({ kind: "imported" });
  });

  it("preserves derived source image lineage through project JSON", () => {
    const figure = createFigureWithDerivedSourceImage();
    const projectJson = createProjectJson(figure);
    const parsed = parseProjectJsonText(JSON.stringify(projectJson));
    const assetUrls = new Map(
      projectJson.figure.sourceImages.map((sourceImage) => [
        sourceImage.assetFileName,
        `blob:${sourceImage.id}`,
      ]),
    );
    const hydrated = hydrateFigure(parsed, assetUrls);
    const derived = hydrated.sourceImages.find((item) => item.id === "source_derived");

    expect(derived?.lineage).toEqual({
      kind: "derived",
      parentSourceImageId: figure.sourceImages[0]?.id,
      roiId: "roi_test",
      cropRect: { x: 12, y: 14, width: 120, height: 80 },
    });
  });
});

function createFigureWithSourceImage(): Figure {
  return projectReducer(createInitialProject(), {
    type: "sourceImageImported",
    imported: IMPORTED_SOURCE_IMAGE,
  });
}

function createLegacySourceImage(sourceImage: {
  readonly id: string;
  readonly name: string;
  readonly assetFileName: string;
  readonly width: number;
  readonly height: number;
  readonly referencedBy: readonly string[];
}) {
  return {
    id: sourceImage.id,
    name: sourceImage.name,
    assetFileName: sourceImage.assetFileName,
    width: sourceImage.width,
    height: sourceImage.height,
    referencedBy: sourceImage.referencedBy,
  };
}

function createFigureWithDerivedSourceImage(): Figure {
  const figure = createFigureWithSourceImage();
  const parent = figure.sourceImages[0];
  if (!parent) {
    throw new Error("Expected a parent Source Image.");
  }
  return {
    ...figure,
    sourceImages: [
      parent,
      {
        ...parent,
        id: "source_derived",
        name: "sample crop.png",
        assetUrl: "blob:runtime-derived",
        assetFileName: "source_derived_sample-crop.png",
        width: 120,
        height: 80,
        referencedBy: [],
        lineage: {
          kind: "derived",
          parentSourceImageId: parent.id,
          roiId: "roi_test",
          cropRect: { x: 12, y: 14, width: 120, height: 80 },
        },
      },
    ],
  };
}
