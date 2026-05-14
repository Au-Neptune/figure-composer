import { Image as ImageIcon } from "lucide-react";
import type { ReactElement } from "react";
import type { Figure, SourceImageObject } from "../editor/model/figure";
import type { SourceImage } from "../editor/model/sourceImage";
import "./SourceImageList.css";

interface SourceImageListProps {
  readonly figure: Figure;
  readonly onSelectFigureObject: (objectId: string) => void;
}

interface SourceImageListItem {
  readonly sourceImage: SourceImage;
  readonly sourceObject: SourceImageObject | null;
}

export function SourceImageList({
  figure,
  onSelectFigureObject,
}: SourceImageListProps): ReactElement {
  const items = figure.sourceImages.map((sourceImage) => ({
    sourceImage,
    sourceObject: findSourceObject(figure, sourceImage.id),
  }));
  return (
    <div className="inspector-section">
      <h2>Source Image List</h2>
      <div className="source-image-list">
        {items.length > 0 ? (
          items.map((item) => (
            <SourceImageButton
              key={item.sourceImage.id}
              item={item}
              selectedObjectId={figure.selectedObjectId}
              onSelectFigureObject={onSelectFigureObject}
            />
          ))
        ) : (
          <p className="source-image-empty">No Source Images</p>
        )}
      </div>
    </div>
  );
}

function SourceImageButton({
  item,
  selectedObjectId,
  onSelectFigureObject,
}: {
  readonly item: SourceImageListItem;
  readonly selectedObjectId: string | null;
  readonly onSelectFigureObject: (objectId: string) => void;
}): ReactElement {
  const selected = item.sourceObject?.id === selectedObjectId;
  const referenceLabel = item.sourceObject
    ? `References: ${item.sourceImage.referencedBy.length}`
    : "Missing Figure object";
  return (
    <button
      className={`source-image-button${selected ? " is-selected" : ""}`}
      type="button"
      onClick={() => selectSourceObject(item, onSelectFigureObject)}
    >
      <span className="source-image-icon" aria-hidden="true">
        <ImageIcon size={16} strokeWidth={2} />
      </span>
      <span className="source-image-body">
        <span className="source-image-name">{item.sourceImage.name}</span>
        <span className="source-image-meta">
          {item.sourceImage.width} x {item.sourceImage.height} px
        </span>
        <span className="source-image-meta">{referenceLabel}</span>
      </span>
    </button>
  );
}

function findSourceObject(
  figure: Figure,
  sourceImageId: string,
): SourceImageObject | null {
  const object = figure.objects.find(
    (item) => item.kind === "sourceImage" && item.sourceImageId === sourceImageId,
  );
  return object?.kind === "sourceImage" ? object : null;
}

function selectSourceObject(
  item: SourceImageListItem,
  onSelectFigureObject: (objectId: string) => void,
): void {
  if (!item.sourceObject) {
    throw new Error(`Source Image has no Figure object: ${item.sourceImage.id}`);
  }
  onSelectFigureObject(item.sourceObject.id);
}
