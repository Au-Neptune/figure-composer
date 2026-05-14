import type { Figure, FigureObject } from "../model/figure";
import { getRoi } from "../model/selectors";

export function deleteRoi(figure: Figure, roiId: string): Figure {
  getRoi(figure, roiId);
  assertRoiHasNoDerivedSourceImage(figure, roiId);
  const linkedInsetIds = createLinkedInsetIdSet(figure.objects, roiId);
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

function assertRoiHasNoDerivedSourceImage(figure: Figure, roiId: string): void {
  const derivedSourceImage = figure.sourceImages.find(
    (sourceImage) =>
      sourceImage.lineage.kind === "derived" && sourceImage.lineage.roiId === roiId,
  );
  if (derivedSourceImage) {
    throw new Error(
      `Cannot delete ROI because Source Image "${derivedSourceImage.name}" was derived from it.`,
    );
  }
}
