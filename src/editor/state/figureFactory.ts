import type { ExportPreset } from "../model/exportPreset";
import type { Figure, SourceImageObject } from "../model/figure";
import { fitWithin } from "../model/geometry";
import type {
  DerivedSourceImageOperation,
  ImportedSourceImage,
  SourceImage,
  SourceImageLineage,
} from "../model/sourceImage";
import { createAssetFileName } from "../project/assetNames";
import {
  DEFAULT_CANVAS_BACKGROUND,
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_DPI,
  DEFAULT_JPG_QUALITY,
  IMPORT_IMAGE_MAX_HEIGHT,
  IMPORT_IMAGE_MAX_WIDTH,
  IMPORT_IMAGE_OFFSET,
  IMPORT_IMAGE_START_X,
  IMPORT_IMAGE_START_Y,
} from "./editorDefaults";
import { createId } from "./idFactory";

export function createInitialFigure(): Figure {
  const preset = createDefaultExportPreset();
  return {
    id: createId("figure"),
    canvas: {
      width: DEFAULT_CANVAS_WIDTH,
      height: DEFAULT_CANVAS_HEIGHT,
      background: DEFAULT_CANVAS_BACKGROUND,
    },
    sourceImages: [],
    objects: [],
    rois: [],
    exportPresets: [preset],
    selectedObjectId: null,
    selectedRoiId: null,
    tool: "select",
  };
}

export function addSourceImageToFigure(
  figure: Figure,
  imported: ImportedSourceImage,
): Figure {
  return addSourceImageAssetToFigure(figure, {
    ...imported,
    lineage: { kind: "imported" },
  });
}

export interface DerivedSourceImageInput extends ImportedSourceImage {
  readonly parentSourceImageId: string;
  readonly operation: DerivedSourceImageOperation;
}

export function addDerivedSourceImageToFigure(
  figure: Figure,
  derived: DerivedSourceImageInput,
): Figure {
  return addSourceImageAssetToFigure(figure, {
    name: derived.name,
    assetUrl: derived.assetUrl,
    width: derived.width,
    height: derived.height,
    lineage: {
      kind: "derived",
      parentSourceImageId: derived.parentSourceImageId,
      operation: derived.operation,
      ...createLegacyCropLineageFields(derived.operation),
    },
  });
}

interface SourceImageAssetInput extends ImportedSourceImage {
  readonly lineage: SourceImageLineage;
}

function addSourceImageAssetToFigure(
  figure: Figure,
  input: SourceImageAssetInput,
): Figure {
  const id = createId("source");
  const sourceImage: SourceImage = {
    id,
    name: input.name,
    assetUrl: input.assetUrl,
    assetFileName: createAssetFileName(id, input.name),
    width: input.width,
    height: input.height,
    referencedBy: [],
    lineage: input.lineage,
  };
  const object = createSourceImageObject(sourceImage, figure.objects.length);
  return {
    ...figure,
    sourceImages: [...figure.sourceImages, sourceImage],
    objects: [...figure.objects, object],
    selectedObjectId: object.id,
    selectedRoiId: null,
    tool: "select",
  };
}

function createDefaultExportPreset(): ExportPreset {
  return {
    id: createId("preset"),
    name: "PNG 300 DPI",
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
    dpi: DEFAULT_DPI,
    format: "png",
    background: DEFAULT_CANVAS_BACKGROUND,
    jpgQuality: DEFAULT_JPG_QUALITY,
  };
}

function createLegacyCropLineageFields(operation: DerivedSourceImageOperation) {
  return operation.kind === "crop"
    ? { roiId: operation.roiId, cropRect: operation.cropRect }
    : {};
}

function createSourceImageObject(
  sourceImage: SourceImage,
  index: number,
): SourceImageObject {
  const fitted = fitWithin(sourceImage, {
    width: IMPORT_IMAGE_MAX_WIDTH,
    height: IMPORT_IMAGE_MAX_HEIGHT,
  });
  return {
    id: createId("object"),
    kind: "sourceImage",
    sourceImageId: sourceImage.id,
    x: IMPORT_IMAGE_START_X + index * IMPORT_IMAGE_OFFSET,
    y: IMPORT_IMAGE_START_Y + index * IMPORT_IMAGE_OFFSET,
    width: fitted.width,
    height: fitted.height,
  };
}
