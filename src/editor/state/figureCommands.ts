import type { ExportPreset } from "../model/exportPreset";
import type {
  Figure,
  FigureObject,
  InsetObject,
  SourceImageObject,
  ToolMode,
} from "../model/figure";
import type { Rect, Size } from "../model/geometry";
import { fitWithin, hasRenderableArea } from "../model/geometry";
import type { RegionOfInterest } from "../model/roi";
import type { ImportedSourceImage, SourceImage } from "../model/sourceImage";
import { createAssetFileName } from "../project/assetNames";
import {
  getFigureObject,
  getRoi,
  getSourceImage,
  getSourceImageObject,
  mapStageRectToSourceRect,
} from "../model/selectors";
import {
  DEFAULT_CANVAS_BACKGROUND,
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_DPI,
  DEFAULT_INSET_GAP,
  DEFAULT_INSET_WIDTH,
  DEFAULT_JPG_QUALITY,
  IMPORT_IMAGE_MAX_HEIGHT,
  IMPORT_IMAGE_MAX_WIDTH,
  IMPORT_IMAGE_OFFSET,
  IMPORT_IMAGE_START_X,
  IMPORT_IMAGE_START_Y,
  ROI_FRAME_STROKE,
  ROI_FRAME_STROKE_WIDTH,
} from "./editorDefaults";

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
  const id = createId("source");
  const sourceImage: SourceImage = {
    id,
    name: imported.name,
    assetUrl: imported.assetUrl,
    assetFileName: createAssetFileName(id, imported.name),
    width: imported.width,
    height: imported.height,
    referencedBy: [],
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

export function createLinkedInsetFromStageRect(
  figure: Figure,
  sourceObjectId: string,
  stageRect: Rect,
): Figure {
  const sourceObject = getSourceImageObject(figure, sourceObjectId);
  const sourceImage = getSourceImage(figure, sourceObject.sourceImageId);
  const sourceRect = mapStageRectToSourceRect(stageRect, sourceObject, sourceImage);
  assertRenderableRect(sourceRect, "Region Of Interest");
  const roi = createRoi(sourceImage.id, sourceObject.id, sourceRect);
  const inset = createInsetObject({
    figure,
    sourceObject,
    sourceImageId: sourceImage.id,
    roi,
  });
  return {
    ...figure,
    sourceImages: markSourceImageReferenced(figure.sourceImages, sourceImage.id, [
      roi.id,
      inset.id,
    ]),
    rois: [...figure.rois, roi],
    objects: [...figure.objects, inset],
    selectedObjectId: inset.id,
    selectedRoiId: null,
    tool: "select",
  };
}

export function moveFigureObject(
  figure: Figure,
  objectId: string,
  nextPosition: { readonly x: number; readonly y: number },
): Figure {
  getFigureObject(figure, objectId);
  return {
    ...figure,
    objects: figure.objects.map((object) =>
      object.id === objectId ? { ...object, ...nextPosition } : object,
    ),
  };
}

export function resizeFigureObject(
  figure: Figure,
  objectId: string,
  nextBounds: Rect,
): Figure {
  assertRenderableRect(nextBounds, "Figure object");
  getFigureObject(figure, objectId);
  return {
    ...figure,
    objects: figure.objects.map((object) =>
      object.id === objectId ? { ...object, ...nextBounds } : object,
    ),
  };
}

export function updateRoiFromStageRect(
  figure: Figure,
  roiId: string,
  stageRect: Rect,
): Figure {
  const roi = getRoi(figure, roiId);
  const sourceObject = getSourceImageObject(figure, roi.sourceObjectId);
  const sourceImage = getSourceImage(figure, roi.sourceImageId);
  const sourceRect = mapStageRectToSourceRect(stageRect, sourceObject, sourceImage);
  assertRenderableRect(sourceRect, "Region Of Interest");
  return {
    ...figure,
    rois: figure.rois.map((item) =>
      item.id === roiId ? { ...item, rect: sourceRect } : item,
    ),
  };
}

export function selectFigureObject(figure: Figure, objectId: string | null): Figure {
  if (objectId) {
    getFigureObject(figure, objectId);
  }
  return {
    ...figure,
    selectedObjectId: objectId,
    selectedRoiId: null,
  };
}

export function selectRoiFrame(figure: Figure, roiId: string): Figure {
  getRoi(figure, roiId);
  return {
    ...figure,
    selectedObjectId: null,
    selectedRoiId: roiId,
  };
}

export function setTool(figure: Figure, tool: ToolMode): Figure {
  return { ...figure, tool };
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

function createRoi(
  sourceImageId: string,
  sourceObjectId: string,
  rect: Rect,
): RegionOfInterest {
  return {
    id: createId("roi"),
    sourceImageId,
    sourceObjectId,
    rect,
    frame: {
      visible: true,
      stroke: ROI_FRAME_STROKE,
      strokeWidth: ROI_FRAME_STROKE_WIDTH,
    },
  };
}

interface CreateInsetObjectOptions {
  readonly figure: Figure;
  readonly sourceObject: SourceImageObject;
  readonly sourceImageId: string;
  readonly roi: RegionOfInterest;
}

function createInsetObject({
  figure,
  sourceObject,
  sourceImageId,
  roi,
}: CreateInsetObjectOptions): InsetObject {
  const size = createInsetSize(roi.rect);
  const x = sourceObject.x + sourceObject.width + DEFAULT_INSET_GAP;
  const y = sourceObject.y;
  const nextY = sourceObject.y + sourceObject.height + DEFAULT_INSET_GAP;
  return {
    id: createId("object"),
    kind: "inset",
    sourceImageId,
    roiId: roi.id,
    x: x + size.width <= figure.canvas.width ? x : sourceObject.x,
    y: x + size.width <= figure.canvas.width ? y : nextY,
    width: size.width,
    height: size.height,
  };
}

function createInsetSize(roiRect: Size): Size {
  const ratio = roiRect.height / roiRect.width;
  return {
    width: DEFAULT_INSET_WIDTH,
    height: Math.round(DEFAULT_INSET_WIDTH * ratio),
  };
}

function markSourceImageReferenced(
  sourceImages: readonly SourceImage[],
  sourceImageId: string,
  references: readonly string[],
): readonly SourceImage[] {
  return sourceImages.map((sourceImage) =>
    sourceImage.id === sourceImageId
      ? { ...sourceImage, referencedBy: [...sourceImage.referencedBy, ...references] }
      : sourceImage,
  );
}

function assertRenderableRect(rect: Size, label: string): void {
  if (!hasRenderableArea(rect)) {
    throw new Error(`${label} must have a positive width and height.`);
  }
}

function createId(prefix: string): string {
  if (!globalThis.crypto?.randomUUID) {
    throw new Error("crypto.randomUUID is required to create Figure model ids.");
  }
  return `${prefix}_${globalThis.crypto.randomUUID()}`;
}
