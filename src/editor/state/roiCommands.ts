import type { Figure, FigureObject } from "../model/figure";
import { getRoi } from "../model/selectors";

export interface RoiDeleteBlocker {
  readonly message: string;
}

export function deleteRoi(figure: Figure, roiId: string): Figure {
  getRoi(figure, roiId);
  const linkedInsetIds = createLinkedInsetIdSet(figure.objects, roiId);
  const blocker = getRoiDeleteBlocker(figure, roiId, linkedInsetIds);
  if (blocker) {
    throw new Error(blocker.message);
  }
  const deletedReferenceIds = new Set([roiId, ...linkedInsetIds]);
  return {
    ...figure,
    objects: figure.objects.filter((object) => !linkedInsetIds.has(object.id)),
    rois: figure.rois.filter((roi) => roi.id !== roiId),
    sourceImages: removeDeletedReferences(figure, deletedReferenceIds),
    selectedObjectId: getNextSelectedObjectId(figure, linkedInsetIds),
    selectedRoiId: figure.selectedRoiId === roiId ? null : figure.selectedRoiId,
  };
}

export function getRoiDeleteBlocker(
  figure: Figure,
  roiId: string,
  linkedInsetIds = createLinkedInsetIdSet(figure.objects, roiId),
): RoiDeleteBlocker | null {
  getRoi(figure, roiId);
  return (
    getChildRoiBlocker(figure, linkedInsetIds) ??
    getDerivedSourceImageBlocker(figure, roiId)
  );
}

function getChildRoiBlocker(
  figure: Figure,
  linkedInsetIds: ReadonlySet<string>,
): RoiDeleteBlocker | null {
  const childRoi = figure.rois.find((roi) => linkedInsetIds.has(roi.sourceObjectId));
  if (!childRoi) {
    return null;
  }
  return {
    message: `Cannot delete ROI because child ROI ${childRoi.id} depends on it.`,
  };
}

function createLinkedInsetIdSet(
  objects: readonly FigureObject[],
  roiId: string,
): ReadonlySet<string> {
  return new Set(
    objects
      .filter((object) => object.kind === "inset" && object.roiId === roiId)
      .map((object) => object.id),
  );
}

function removeDeletedReferences(
  figure: Figure,
  deletedReferenceIds: ReadonlySet<string>,
): Figure["sourceImages"] {
  return figure.sourceImages.map((sourceImage) => ({
    ...sourceImage,
    referencedBy: sourceImage.referencedBy.filter(
      (referenceId) => !deletedReferenceIds.has(referenceId),
    ),
  }));
}

function getNextSelectedObjectId(
  figure: Figure,
  linkedInsetIds: ReadonlySet<string>,
): string | null {
  if (!figure.selectedObjectId || linkedInsetIds.has(figure.selectedObjectId)) {
    return null;
  }
  return figure.selectedObjectId;
}

function getDerivedSourceImageBlocker(
  figure: Figure,
  roiId: string,
): RoiDeleteBlocker | null {
  const derivedSourceImage = figure.sourceImages.find(
    (sourceImage) =>
      sourceImage.lineage.kind === "derived" && sourceImage.lineage.roiId === roiId,
  );
  if (!derivedSourceImage) {
    return null;
  }
  return {
    message: `Cannot delete ROI because Source Image "${derivedSourceImage.name}" was derived from it.`,
  };
}
