import type { Figure, FigureObject, SourceImageObject } from "./figure";
import type { Point, Rect } from "./geometry";
import { clampRectToSize } from "./geometry";
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

export function getSourceImageObject(
  figure: Figure,
  objectId: string,
): SourceImageObject {
  const object = getFigureObject(figure, objectId);
  if (object.kind !== "sourceImage") {
    throw new Error(`Figure object is not a Source Image: ${objectId}`);
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

export function findTopSourceImageAtPoint(
  figure: Figure,
  point: Point,
): SourceImageObject | null {
  const objects = [...figure.objects].reverse();
  const object = objects.find(
    (item) => item.kind === "sourceImage" && pointInsideObject(point, item),
  );
  return object && object.kind === "sourceImage" ? object : null;
}

export function pointInsideObject(point: Point, object: FigureObject): boolean {
  const insideX = point.x >= object.x && point.x <= object.x + object.width;
  const insideY = point.y >= object.y && point.y <= object.y + object.height;
  return insideX && insideY;
}

export function mapStageRectToSourceRect(
  stageRect: Rect,
  sourceObject: SourceImageObject,
  sourceImage: SourceImage,
): Rect {
  const scaleX = sourceImage.width / sourceObject.width;
  const scaleY = sourceImage.height / sourceObject.height;
  const sourceRect = {
    x: (stageRect.x - sourceObject.x) * scaleX,
    y: (stageRect.y - sourceObject.y) * scaleY,
    width: stageRect.width * scaleX,
    height: stageRect.height * scaleY,
  };
  return clampRectToSize(sourceRect, sourceImage);
}

export function mapSourceRectToStageRect(
  sourceRect: Rect,
  sourceObject: SourceImageObject,
  sourceImage: SourceImage,
): Rect {
  const scaleX = sourceObject.width / sourceImage.width;
  const scaleY = sourceObject.height / sourceImage.height;
  return {
    x: sourceObject.x + sourceRect.x * scaleX,
    y: sourceObject.y + sourceRect.y * scaleY,
    width: sourceRect.width * scaleX,
    height: sourceRect.height * scaleY,
  };
}

