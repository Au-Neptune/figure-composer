import type {
  CanvasSettingsPatch,
  Figure,
  FigureObject,
  InsetObject,
  InsetDockSide,
  SourceImageObject,
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
  getSourceImageObject,
  mapStageRectToSourceRect,
} from "../model/selectors";
import {
  DEFAULT_INSET_GAP,
  DEFAULT_INSET_WIDTH,
  ROI_FRAME_STROKE,
  ROI_FRAME_STROKE_WIDTH,
} from "./editorDefaults";
import { createId } from "./idFactory";

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
  const sourceObject = getSourceImageObject(figure, roi.sourceObjectId);
  const sourceImage = getSourceImage(figure, roi.sourceImageId);
  const constrainedStageRect = constrainRectWithinRect(stageRect, sourceObject);
  const sourceRect = mapStageRectToSourceRect(
    constrainedStageRect,
    sourceObject,
    sourceImage,
  );
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
  const sourceObject = getSourceImageObject(figure, roi.sourceObjectId);
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

function getInsetObject(figure: Figure, objectId: string): InsetObject {
  const object = getFigureObject(figure, objectId);
  if (object.kind !== "inset") {
    throw new Error(`Figure object is not an Inset: ${objectId}`);
  }
  return object;
}

function createDockedInsetBounds(
  inset: InsetObject,
  sourceObject: SourceImageObject,
  side: InsetDockSide,
): Rect {
  const centeredX = sourceObject.x + (sourceObject.width - inset.width) / 2;
  const centeredY = sourceObject.y + (sourceObject.height - inset.height) / 2;
  switch (side) {
    case "top":
      return {
        ...inset,
        x: centeredX,
        y: sourceObject.y - inset.height - DEFAULT_INSET_GAP,
      };
    case "right":
      return {
        ...inset,
        x: sourceObject.x + sourceObject.width + DEFAULT_INSET_GAP,
        y: centeredY,
      };
    case "bottom":
      return {
        ...inset,
        x: centeredX,
        y: sourceObject.y + sourceObject.height + DEFAULT_INSET_GAP,
      };
    case "left":
      return {
        ...inset,
        x: sourceObject.x - inset.width - DEFAULT_INSET_GAP,
        y: centeredY,
      };
  }
}
