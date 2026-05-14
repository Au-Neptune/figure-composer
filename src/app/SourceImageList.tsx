import { Check, Image as ImageIcon, Pencil, Trash2, X } from "lucide-react";
import { useState, type FormEvent, type ReactElement } from "react";
import type { Figure, SourceImageObject } from "../editor/model/figure";
import type { SourceImage } from "../editor/model/sourceImage";
import "./SourceImageList.css";

interface SourceImageListProps {
  readonly figure: Figure;
  readonly onSelectFigureObject: (objectId: string) => void;
  readonly onRenameSourceImage: (sourceImageId: string, name: string) => boolean;
  readonly onDeleteSourceImage: (sourceImageId: string) => boolean;
}

interface SourceImageListItem {
  readonly sourceImage: SourceImage;
  readonly sourceObject: SourceImageObject | null;
}

interface SourceImageItemProps {
  readonly item: SourceImageListItem;
  readonly selectedObjectId: string | null;
  readonly onSelectFigureObject: (objectId: string) => void;
  readonly onRenameSourceImage: (sourceImageId: string, name: string) => boolean;
  readonly onDeleteSourceImage: (sourceImageId: string) => boolean;
}

interface SourceImageDisplayProps {
  readonly item: SourceImageListItem;
  readonly selected: boolean;
  readonly onSelectFigureObject: (objectId: string) => void;
  readonly onStartRename: () => void;
  readonly onDeleteSourceImage: (sourceImageId: string) => boolean;
}

export function SourceImageList({
  figure,
  onSelectFigureObject,
  onRenameSourceImage,
  onDeleteSourceImage,
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
            <SourceImageItem
              key={item.sourceImage.id}
              item={item}
              selectedObjectId={figure.selectedObjectId}
              onSelectFigureObject={onSelectFigureObject}
              onRenameSourceImage={onRenameSourceImage}
              onDeleteSourceImage={onDeleteSourceImage}
            />
          ))
        ) : (
          <p className="source-image-empty">No Source Images</p>
        )}
      </div>
    </div>
  );
}

function SourceImageItem({
  item,
  selectedObjectId,
  onSelectFigureObject,
  onRenameSourceImage,
  onDeleteSourceImage,
}: SourceImageItemProps): ReactElement {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(item.sourceImage.name);
  const selected = item.sourceObject?.id === selectedObjectId;
  if (editing) {
    return (
      <SourceImageRenameForm
        sourceImage={item.sourceImage}
        draftName={draftName}
        onDraftNameChange={setDraftName}
        onCancel={() => setEditing(false)}
        onConfirm={() => {
          if (onRenameSourceImage(item.sourceImage.id, draftName)) {
            setEditing(false);
          }
        }}
      />
    );
  }
  return (
    <SourceImageDisplay
      item={item}
      selected={selected}
      onSelectFigureObject={onSelectFigureObject}
      onStartRename={() => {
        setDraftName(item.sourceImage.name);
        setEditing(true);
      }}
      onDeleteSourceImage={onDeleteSourceImage}
    />
  );
}

function SourceImageDisplay({
  item,
  selected,
  onSelectFigureObject,
  onStartRename,
  onDeleteSourceImage,
}: SourceImageDisplayProps): ReactElement {
  return (
    <div className={`source-image-item${selected ? " is-selected" : ""}`}>
      <button
        className="source-image-select"
        type="button"
        onClick={() => selectSourceObject(item, onSelectFigureObject)}
      >
        <SourceImageIcon />
        <SourceImageSummary item={item} />
      </button>
      <div className="source-image-actions">
        <button
          className="source-image-icon-button"
          type="button"
          title="Rename Source Image"
          aria-label={`Rename ${item.sourceImage.name}`}
          onClick={onStartRename}
        >
          <Pencil size={15} strokeWidth={2} />
        </button>
        <button
          className="source-image-icon-button is-danger"
          type="button"
          title="Delete Source Image"
          aria-label={`Delete ${item.sourceImage.name}`}
          onClick={() => onDeleteSourceImage(item.sourceImage.id)}
        >
          <Trash2 size={15} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function SourceImageRenameForm({
  sourceImage,
  draftName,
  onDraftNameChange,
  onCancel,
  onConfirm,
}: {
  readonly sourceImage: SourceImage;
  readonly draftName: string;
  readonly onDraftNameChange: (name: string) => void;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}): ReactElement {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onConfirm();
  };
  return (
    <form className="source-image-edit-form" onSubmit={handleSubmit}>
      <SourceImageIcon />
      <input
        className="source-image-name-input"
        value={draftName}
        aria-label={`Source Image name for ${sourceImage.name}`}
        autoFocus
        onChange={(event) => onDraftNameChange(event.currentTarget.value)}
      />
      <div className="source-image-actions">
        <button
          className="source-image-icon-button"
          type="submit"
          title="Save Source Image name"
          aria-label="Save Source Image name"
        >
          <Check size={15} strokeWidth={2} />
        </button>
        <button
          className="source-image-icon-button"
          type="button"
          title="Cancel rename"
          aria-label="Cancel rename"
          onClick={onCancel}
        >
          <X size={15} strokeWidth={2} />
        </button>
      </div>
    </form>
  );
}

function SourceImageSummary({
  item,
}: {
  readonly item: SourceImageListItem;
}): ReactElement {
  const referenceLabel = item.sourceObject
    ? `References: ${item.sourceImage.referencedBy.length}`
    : "Missing Figure object";
  return (
    <span className="source-image-body">
      <span className="source-image-name">{item.sourceImage.name}</span>
      <span className="source-image-meta">
        {item.sourceImage.width} x {item.sourceImage.height} px
      </span>
      <span className="source-image-meta">{referenceLabel}</span>
    </span>
  );
}

function SourceImageIcon(): ReactElement {
  return (
    <span className="source-image-icon" aria-hidden="true">
      <ImageIcon size={16} strokeWidth={2} />
    </span>
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
