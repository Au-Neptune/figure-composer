import type { Figure, FigureObject } from "./figure";
import type { Point, Rect } from "./geometry";
import type { RegionOfInterest } from "./roi";
import type { SourceImage } from "./sourceImage";

export function getSourceImage(
  figure: Figure,
  sourceImageId: string,
): SourceImage {
  const sourceImage = figure.sourceImages.find((item) => item.id === sourceImageId);
  if (!sourceImage) {
    throw new Error(`Source Image not found: ${sourceImageId}`);
  }
  return sourceImage;
}

export function getFigureObject(
  figure: Figure,
  objectId: string,
): FigureObject {
  const object = figure.objects.find((item) => item.id === objectId);
  if (!object) {
    throw new Error(`Figure object not found: ${objectId}`);
  }
  return object;
}

export function getRoi(figure: Figure, roiId: string): RegionOfInterest {
  const roi = figure.rois.find((item) => item.id === roiId);
  if (!roi) {
    throw new Error(`Region Of Interest not found: ${roiId}`);
  }
  return roi;
}

export function findTopFigureObjectAtPoint(
  figure: Figure,
  point: Point,
): FigureObject | null {
  const objects = [...figure.objects].reverse();
  return objects.find((item) => pointInsideObject(point, item)) ?? null;
}

export function pointInsideObject(point: Point, object: FigureObject): boolean {
  const insideX = point.x >= object.x && point.x <= object.x + object.width;
  const insideY = point.y >= object.y && point.y <= object.y + object.height;
  return insideX && insideY;
}

export function mapStageRectToSourceRect(
  stageRect: Rect,
  figure: Figure,
  sourceObject: FigureObject,
): Rect {
  const visibleSourceRect = getVisibleSourceRect(figure, sourceObject);
  const scaleX = visibleSourceRect.width / sourceObject.width;
  const scaleY = visibleSourceRect.height / sourceObject.height;
  return {
    x: visibleSourceRect.x + (stageRect.x - sourceObject.x) * scaleX,
    y: visibleSourceRect.y + (stageRect.y - sourceObject.y) * scaleY,
    width: stageRect.width * scaleX,
    height: stageRect.height * scaleY,
  };
}

export function mapSourceRectToStageRect(
  sourceRect: Rect,
  figure: Figure,
  sourceObject: FigureObject,
): Rect {
  const visibleSourceRect = getVisibleSourceRect(figure, sourceObject);
  const scaleX = sourceObject.width / visibleSourceRect.width;
  const scaleY = sourceObject.height / visibleSourceRect.height;
  return {
    x: sourceObject.x + (sourceRect.x - visibleSourceRect.x) * scaleX,
    y: sourceObject.y + (sourceRect.y - visibleSourceRect.y) * scaleY,
    width: sourceRect.width * scaleX,
    height: sourceRect.height * scaleY,
  };
}

function getVisibleSourceRect(figure: Figure, object: FigureObject): Rect {
  if (object.kind === "inset") {
    return getRoi(figure, object.roiId).rect;
  }
  const sourceImage = getSourceImage(figure, object.sourceImageId);
  return {
    x: 0,
    y: 0,
    width: sourceImage.width,
    height: sourceImage.height,
  };
}
