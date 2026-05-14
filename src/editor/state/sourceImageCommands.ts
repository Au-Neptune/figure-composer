import type { Figure, FigureObject } from "../model/figure";
import type { SourceImage } from "../model/sourceImage";
import { getSourceImage } from "../model/selectors";

const SINGULAR_REFERENCE_COUNT = 1;

export interface RenameSourceImageOptions {
  readonly sourceImageId: string;
  readonly name: string;
}

export function renameSourceImage(
  figure: Figure,
  options: RenameSourceImageOptions,
): Figure {
  const sourceImage = getSourceImage(figure, options.sourceImageId);
  const name = normalizeSourceImageName(options.name);
  return {
    ...figure,
    sourceImages: figure.sourceImages.map((item) =>
      item.id === sourceImage.id ? { ...item, name } : item,
    ),
  };
}

export function deleteSourceImage(figure: Figure, sourceImageId: string): Figure {
  const sourceImage = getSourceImage(figure, sourceImageId);
  validateSourceImageDelete(figure, sourceImage.id);
  const deletedObjectIds = findSourceImageObjectIds(figure.objects, sourceImage.id);
  return {
    ...figure,
    sourceImages: figure.sourceImages.filter((item) => item.id !== sourceImage.id),
    objects: figure.objects.filter((object) =>
      keepObjectAfterSourceImageDelete(object, sourceImage.id),
    ),
    selectedObjectId: clearDeletedSelection(
      figure.selectedObjectId,
      deletedObjectIds,
    ),
  };
}

export function validateSourceImageRename(
  figure: Figure,
  options: RenameSourceImageOptions,
): void {
  getSourceImage(figure, options.sourceImageId);
  normalizeSourceImageName(options.name);
}

export function validateSourceImageDelete(
  figure: Figure,
  sourceImageId: string,
): void {
  const sourceImage = getSourceImage(figure, sourceImageId);
  const references = findBlockingReferences(figure, sourceImage);
  if (references.length > 0) {
    throw new Error(formatBlockedDeleteMessage(sourceImage, references));
  }
}

function normalizeSourceImageName(name: string): string {
  const normalized = name.trim();
  if (!normalized) {
    throw new Error("Source Image name cannot be empty.");
  }
  return normalized;
}

function findBlockingReferences(
  figure: Figure,
  sourceImage: SourceImage,
): readonly string[] {
  const references = new Set(sourceImage.referencedBy);
  for (const roi of figure.rois) {
    if (roi.sourceImageId === sourceImage.id) {
      references.add(roi.id);
    }
  }
  for (const object of figure.objects) {
    if (object.kind === "inset" && object.sourceImageId === sourceImage.id) {
      references.add(object.id);
    }
  }
  for (const item of figure.sourceImages) {
    if (item.lineage.kind === "derived" && item.lineage.parentSourceImageId === sourceImage.id) {
      references.add(item.id);
    }
  }
  return [...references].sort();
}

function formatBlockedDeleteMessage(
  sourceImage: SourceImage,
  references: readonly string[],
): string {
  const referenceLabel =
    references.length === SINGULAR_REFERENCE_COUNT ? "reference" : "references";
  return `Cannot delete Source Image "${sourceImage.name}" because it has ${references.length} ${referenceLabel}: ${references.join(", ")}.`;
}

function findSourceImageObjectIds(
  objects: readonly FigureObject[],
  sourceImageId: string,
): ReadonlySet<string> {
  return new Set(
    objects
      .filter(
        (object) =>
          object.kind === "sourceImage" && object.sourceImageId === sourceImageId,
      )
      .map((object) => object.id),
  );
}

function keepObjectAfterSourceImageDelete(
  object: FigureObject,
  sourceImageId: string,
): boolean {
  return object.kind !== "sourceImage" || object.sourceImageId !== sourceImageId;
}

function clearDeletedSelection(
  selectedObjectId: string | null,
  deletedObjectIds: ReadonlySet<string>,
): string | null {
  return selectedObjectId && deletedObjectIds.has(selectedObjectId)
    ? null
    : selectedObjectId;
}
