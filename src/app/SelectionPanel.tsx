import type { ChangeEvent, ReactElement } from "react";
import type { Figure, FigureObject } from "../editor/model/figure";
import type { Rect } from "../editor/model/geometry";
import { getFigureObject, getSourceImage } from "../editor/model/selectors";
import type { SourceImage } from "../editor/model/sourceImage";
import { MIN_OBJECT_SIDE_PX } from "../editor/state/editorDefaults";
import "./SelectionPanel.css";

type ObjectBoundsPatch = Partial<Pick<Rect, "x" | "y" | "width" | "height">>;
type ObjectBoundsField = keyof ObjectBoundsPatch;

interface SelectionPanelProps {
  readonly figure: Figure;
  readonly onObjectBoundsChange: (
    objectId: string,
    patch: ObjectBoundsPatch,
  ) => void;
}

interface SelectedObjectDetails {
  readonly object: FigureObject;
  readonly sourceImage: SourceImage;
}

export function SelectionPanel({
  figure,
  onObjectBoundsChange,
}: SelectionPanelProps): ReactElement {
  const selection = getSelectedObjectDetails(figure);
  return (
    <aside className="selection-panel">
      <h2>Selection</h2>
      {selection ? (
        <SelectedImageForm
          selection={selection}
          onObjectBoundsChange={onObjectBoundsChange}
        />
      ) : (
        <p className="selection-empty">No image selected.</p>
      )}
    </aside>
  );
}

function SelectedImageForm({
  selection,
  onObjectBoundsChange,
}: {
  readonly selection: SelectedObjectDetails;
  readonly onObjectBoundsChange: (
    objectId: string,
    patch: ObjectBoundsPatch,
  ) => void;
}): ReactElement {
  return (
    <div className="selection-content">
      <SelectionSummary selection={selection} />
      <BoundsEditor
        object={selection.object}
        onObjectBoundsChange={onObjectBoundsChange}
      />
    </div>
  );
}

function SelectionSummary({
  selection,
}: {
  readonly selection: SelectedObjectDetails;
}): ReactElement {
  return (
    <dl className="selection-summary">
      <dt>Name</dt>
      <dd>{selection.sourceImage.name}</dd>
      <dt>Type</dt>
      <dd>{selection.object.kind === "sourceImage" ? "Source Image" : "Inset"}</dd>
      <dt>Source Pixels</dt>
      <dd>
        {selection.sourceImage.width} x {selection.sourceImage.height}
      </dd>
    </dl>
  );
}

function BoundsEditor({
  object,
  onObjectBoundsChange,
}: {
  readonly object: FigureObject;
  readonly onObjectBoundsChange: (
    objectId: string,
    patch: ObjectBoundsPatch,
  ) => void;
}): ReactElement {
  return (
    <div className="preset-editor">
      <BoundsField field="x" object={object} onChange={onObjectBoundsChange} />
      <BoundsField field="y" object={object} onChange={onObjectBoundsChange} />
      <BoundsField field="width" object={object} onChange={onObjectBoundsChange} />
      <BoundsField field="height" object={object} onChange={onObjectBoundsChange} />
    </div>
  );
}

function BoundsField({
  field,
  object,
  onChange,
}: {
  readonly field: ObjectBoundsField;
  readonly object: FigureObject;
  readonly onChange: (objectId: string, patch: ObjectBoundsPatch) => void;
}): ReactElement {
  return (
    <label className="field-row">
      <span>{getFieldLabel(field)}</span>
      <input
        type="number"
        min={getFieldMinimum(field)}
        step={1}
        inputMode="numeric"
        value={toIntegerFieldValue(object[field])}
        onChange={(event) => updateNumberField(field, object.id, event, onChange)}
      />
    </label>
  );
}

function getSelectedObjectDetails(figure: Figure): SelectedObjectDetails | null {
  if (!figure.selectedObjectId) {
    return null;
  }
  const object = getFigureObject(figure, figure.selectedObjectId);
  const sourceImage = getSourceImage(figure, object.sourceImageId);
  return { object, sourceImage };
}

function updateNumberField(
  field: ObjectBoundsField,
  objectId: string,
  event: ChangeEvent<HTMLInputElement>,
  onChange: (objectId: string, patch: ObjectBoundsPatch) => void,
): void {
  if (!event.currentTarget.validity.valid || event.currentTarget.value === "") {
    return;
  }
  onChange(objectId, { [field]: toIntegerFieldValue(Number(event.currentTarget.value)) });
}

function getFieldLabel(field: ObjectBoundsField): string {
  return field === "x" || field === "y" ? field.toUpperCase() : field;
}

function getFieldMinimum(field: ObjectBoundsField): number {
  return field === "width" || field === "height" ? MIN_OBJECT_SIDE_PX : 0;
}

function toIntegerFieldValue(value: number): number {
  return Math.round(value);
}
