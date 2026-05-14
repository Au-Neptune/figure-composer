import type {
  CanvasSettingsPatch,
  Figure,
  FigureImageObject,
  FigureObject,
  InsetObject,
  InsetDockSide,
  ToolMode,
} from "../model/figure";
import type { Rect, Size } from "../model/geometry";
import {
  constrainRectPosition,
  constrainRectWithinBounds,
  constrainRectWithinRect,
  hasRenderableArea,
} from "../model/geometry";
import type { RegionOfInterest } from "../model/roi";
import type { SourceImage } from "../model/sourceImage";
import {
  getFigureObject,
  getRoi,
  getSourceImage,
  isFigureImageObject,
  mapStageRectToSourceRect,
} from "../model/selectors";
import {
  DEFAULT_INSET_WIDTH,
  ROI_FRAME_STROKE,
  ROI_FRAME_STROKE_WIDTH,
} from "./editorDefaults";
import { createId } from "./idFactory";
import { createDockedInsetBounds, getInsetObject } from "./insetDocking";

export function createLinkedInsetFromStageRect(
  figure: Figure,
  sourceObjectId: string,
  stageRect: Rect,
): Figure {
  const sourceObject = getFigureObject(figure, sourceObjectId);
  if (!isFigureImageObject(sourceObject)) {
    throw new Error("Region Of Interest requires a Source Image or Inset object.");
  }
  const sourceImage = getSourceImage(figure, sourceObject.sourceImageId);
  const constrainedStageRect = constrainRectWithinRect(stageRect, sourceObject);
  const sourceRect = mapStageRectToSourceRect(
    constrainedStageRect,
    figure,
    sourceObject,
  );
  assertRenderableRect(sourceRect, "Region Of Interest");
  const roi = createRoi(sourceImage.id, sourceObject.id, sourceRect);
  const inset = createInsetObject({
    figure,
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
  const object = getFigureObject(figure, objectId);
  const nextBounds = constrainRectPosition({ ...object, ...nextPosition }, figure.canvas);
  return {
    ...figure,
    objects: figure.objects.map((object) =>
      object.id === objectId ? { ...object, ...nextBounds } : object,
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
  const constrainedBounds = constrainRectWithinBounds(nextBounds, figure.canvas);
  assertRenderableRect(constrainedBounds, "Figure object");
  return {
    ...figure,
    objects: figure.objects.map((object) =>
      object.id === objectId ? { ...object, ...constrainedBounds } : object,
    ),
  };
}

export function updateRoiFromStageRect(
  figure: Figure,
  roiId: string,
  stageRect: Rect,
): Figure {
  const roi = getRoi(figure, roiId);
  const sourceObject = getRoiSourceObject(figure, roi.sourceObjectId);
  const constrainedStageRect = constrainRectWithinRect(stageRect, sourceObject);
  const sourceRect = mapStageRectToSourceRect(constrainedStageRect, figure, sourceObject);
  assertRenderableRect(sourceRect, "Region Of Interest");
  return {
    ...figure,
    rois: figure.rois.map((item) =>
      item.id === roiId ? { ...item, rect: sourceRect } : item,
    ),
  };
}

export function updateCanvasSettings(
  figure: Figure,
  patch: CanvasSettingsPatch,
): Figure {
  const canvas = validateCanvasSettings({ ...figure.canvas, ...patch });
  return {
    ...figure,
    canvas,
    objects: figure.objects.map((object) => constrainObjectToCanvas(object, canvas)),
  };
}

export function dockInsetObject(
  figure: Figure,
  objectId: string,
  side: InsetDockSide,
): Figure {
  const inset = getInsetObject(figure, objectId);
  const roi = getRoi(figure, inset.roiId);
  const sourceObject = getRoiSourceObject(figure, roi.sourceObjectId);
  const bounds = constrainRectPosition(
    createDockedInsetBounds(inset, sourceObject, side),
    figure.canvas,
  );
  return {
    ...figure,
    objects: figure.objects.map((object) =>
      object.id === objectId ? { ...object, ...bounds } : object,
    ),
    selectedObjectId: objectId,
    selectedRoiId: null,
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
  readonly sourceImageId: string;
  readonly roi: RegionOfInterest;
}

function createInsetObject({
  figure,
  sourceImageId,
  roi,
}: CreateInsetObjectOptions): InsetObject {
  const size = createInsetSize(roi.rect);
  const inset: InsetObject = {
    id: createId("object"),
    kind: "inset",
    sourceImageId,
    roiId: roi.id,
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
  };
  const sourceObject = getRoiSourceObject(figure, roi.sourceObjectId);
  const dockedBounds = createDockedInsetBounds(inset, sourceObject, "right");
  return constrainObjectToCanvas({ ...inset, ...dockedBounds }, figure.canvas);
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

function getRoiSourceObject(
  figure: Figure,
  sourceObjectId: string,
): FigureImageObject {
  const sourceObject = getFigureObject(figure, sourceObjectId);
  if (!isFigureImageObject(sourceObject)) {
    throw new Error("Region Of Interest requires a Source Image or Inset object.");
  }
  return sourceObject;
}

function assertRenderableRect(rect: Size, label: string): void {
  if (!hasRenderableArea(rect)) {
    throw new Error(`${label} must have a positive width and height.`);
  }
}

function validateCanvasSettings(canvas: Figure["canvas"]): Figure["canvas"] {
  assertRenderableRect(canvas, "Figure Layout");
  return canvas;
}

function constrainObjectToCanvas<TObject extends FigureObject>(
  object: TObject,
  canvas: Size,
): TObject {
  return { ...object, ...constrainRectWithinBounds(object, canvas) };
}
