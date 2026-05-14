import type { FigureObject, InsetObject, SourceImageObject } from "../model/figure";
import type { RegionOfInterest } from "../model/roi";
import type { SerializedFigure, SerializedSourceImage } from "./projectJson";

interface ReferenceIndex {
  readonly sourceImageIds: ReadonlySet<string>;
  readonly objectsById: ReadonlyMap<string, FigureObject>;
  readonly roisById: ReadonlyMap<string, RegionOfInterest>;
  readonly referenceIds: ReadonlySet<string>;
}

export function validateProjectReferences(figure: SerializedFigure): void {
  const index = createReferenceIndex(figure);
  validateFigureObjectReferences(figure.objects, index);
  validateRoiReferences(figure.rois, index);
  validateSourceImages(figure.sourceImages, index);
}

function createReferenceIndex(figure: SerializedFigure): ReferenceIndex {
  const sourceImageIds = createSourceImageIdSet(figure.sourceImages);
  const objectsById = createIdMap(figure.objects, "Figure object");
  const roisById = createIdMap(figure.rois, "ROI");
  return {
    sourceImageIds,
    objectsById,
    roisById,
    referenceIds: new Set([...objectsById.keys(), ...roisById.keys()]),
  };
}

function validateFigureObjectReferences(
  objects: readonly FigureObject[],
  index: ReferenceIndex,
): void {
  for (const object of objects) {
    assertSourceImageExists(index, object.sourceImageId, `Figure object ${object.id}`);
    if (object.kind === "inset") {
      validateInsetReference(object, index);
    }
  }
}

function validateInsetReference(
  inset: InsetObject,
  index: ReferenceIndex,
): void {
  const roi = index.roisById.get(inset.roiId);
  if (!roi) {
    throw new Error(`Inset ${inset.id} references missing ROI: ${inset.roiId}`);
  }
  if (roi.sourceImageId !== inset.sourceImageId) {
    throw new Error(`Inset ${inset.id} source does not match ROI ${roi.id}.`);
  }
}

function validateRoiReferences(
  rois: readonly RegionOfInterest[],
  index: ReferenceIndex,
): void {
  for (const roi of rois) {
    assertSourceImageExists(index, roi.sourceImageId, `ROI ${roi.id}`);
    validateRoiSourceObject(roi, index);
  }
}

function validateRoiSourceObject(
  roi: RegionOfInterest,
  index: ReferenceIndex,
): void {
  const object = index.objectsById.get(roi.sourceObjectId);
  if (!object || object.kind !== "sourceImage") {
    throw new Error(`ROI ${roi.id} references missing Source Image object.`);
  }
  if (object.sourceImageId !== roi.sourceImageId) {
    throw new Error(`ROI ${roi.id} source does not match object ${object.id}.`);
  }
}

function validateSourceImages(
  sourceImages: readonly SerializedSourceImage[],
  index: ReferenceIndex,
): void {
  for (const sourceImage of sourceImages) {
    validateReferencedBy(sourceImage, index);
    validateSourceImageLineage(sourceImage, index);
  }
}

function validateReferencedBy(
  sourceImage: SerializedSourceImage,
  index: ReferenceIndex,
): void {
  for (const referenceId of sourceImage.referencedBy) {
    if (!index.referenceIds.has(referenceId)) {
      throw new Error(
        `Source Image ${sourceImage.id} references missing item: ${referenceId}`,
      );
    }
  }
}

function validateSourceImageLineage(
  sourceImage: SerializedSourceImage,
  index: ReferenceIndex,
): void {
  if (sourceImage.lineage.kind !== "derived") {
    return;
  }
  assertSourceImageExists(
    index,
    sourceImage.lineage.parentSourceImageId,
    `Derived Source Image ${sourceImage.id}`,
  );
  if (!index.roisById.has(sourceImage.lineage.roiId)) {
    throw new Error(
      `Derived Source Image ${sourceImage.id} references missing ROI: ${sourceImage.lineage.roiId}`,
    );
  }
}

function assertSourceImageExists(
  index: ReferenceIndex,
  sourceImageId: string,
  label: string,
): void {
  if (!index.sourceImageIds.has(sourceImageId)) {
    throw new Error(`${label} references missing Source Image: ${sourceImageId}`);
  }
}

function createSourceImageIdSet(
  sourceImages: readonly SerializedSourceImage[],
): ReadonlySet<string> {
  const ids = new Set<string>();
  for (const sourceImage of sourceImages) {
    if (ids.has(sourceImage.id)) {
      throw new Error(`Source Image id is duplicated: ${sourceImage.id}`);
    }
    ids.add(sourceImage.id);
  }
  return ids;
}

function createIdMap<TItem extends { readonly id: string }>(
  items: readonly TItem[],
  label: string,
): ReadonlyMap<string, TItem> {
  const map = new Map<string, TItem>();
  for (const item of items) {
    if (map.has(item.id)) {
      throw new Error(`${label} id is duplicated: ${item.id}`);
    }
    map.set(item.id, item);
  }
  return map;
}
