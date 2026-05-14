import type { ExportPreset } from "../model/exportPreset";
import type { Figure, FigureObject } from "../model/figure";
import type { RegionOfInterest } from "../model/roi";
import type { SourceImage } from "../model/sourceImage";

export const PROJECT_ASSETS_DIR_NAME = "assets";
export const PROJECT_JSON_FILE_NAME = "project.json";
export const PROJECT_FORMAT_NAME = "figure-composer.folder-project";
export const PROJECT_FORMAT_VERSION = 1;

export type SerializedSourceImage = Omit<SourceImage, "assetUrl">;

export interface SerializedFigure {
  readonly id: string;
  readonly canvas: Figure["canvas"];
  readonly sourceImages: readonly SerializedSourceImage[];
  readonly objects: readonly FigureObject[];
  readonly rois: readonly RegionOfInterest[];
  readonly exportPresets: readonly ExportPreset[];
}

export interface ProjectJson {
  readonly format: typeof PROJECT_FORMAT_NAME;
  readonly version: typeof PROJECT_FORMAT_VERSION;
  readonly figure: SerializedFigure;
}

export function createProjectJson(figure: Figure): ProjectJson {
  return {
    format: PROJECT_FORMAT_NAME,
    version: PROJECT_FORMAT_VERSION,
    figure: {
      id: figure.id,
      canvas: figure.canvas,
      sourceImages: figure.sourceImages.map(serializeSourceImage),
      objects: figure.objects,
      rois: figure.rois,
      exportPresets: figure.exportPresets,
    },
  };
}

export function hydrateFigure(
  projectJson: ProjectJson,
  assetUrls: ReadonlyMap<string, string>,
): Figure {
  return {
    ...projectJson.figure,
    sourceImages: projectJson.figure.sourceImages.map((sourceImage) =>
      hydrateSourceImage(sourceImage, assetUrls),
    ),
    selectedObjectId: null,
    selectedRoiId: null,
    tool: "select",
  };
}

function serializeSourceImage(sourceImage: SourceImage): SerializedSourceImage {
  return {
    id: sourceImage.id,
    name: sourceImage.name,
    assetFileName: sourceImage.assetFileName,
    width: sourceImage.width,
    height: sourceImage.height,
    referencedBy: sourceImage.referencedBy,
    lineage: sourceImage.lineage,
  };
}

function hydrateSourceImage(
  sourceImage: SerializedSourceImage,
  assetUrls: ReadonlyMap<string, string>,
): SourceImage {
  const assetUrl = assetUrls.get(sourceImage.assetFileName);
  if (!assetUrl) {
    throw new Error(`Project asset was not loaded: ${sourceImage.assetFileName}`);
  }
  return { ...sourceImage, assetUrl };
}
