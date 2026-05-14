import type { ChangeEvent, ReactElement } from "react";
import type { CanvasSettings, CanvasSettingsPatch } from "../editor/model/figure";
import { MIN_EXPORT_DIMENSION } from "../editor/state/editorDefaults";

type NumericCanvasField = "width" | "height";

interface FigureLayoutEditorProps {
  readonly canvas: CanvasSettings;
  readonly onChange: (patch: CanvasSettingsPatch) => void;
}

export function FigureLayoutEditor({
  canvas,
  onChange,
}: FigureLayoutEditorProps): ReactElement {
  return (
    <div className="preset-editor">
      <NumberField label="Width" field="width" canvas={canvas} onChange={onChange} />
      <NumberField label="Height" field="height" canvas={canvas} onChange={onChange} />
      <label className="field-row">
        <span>Background</span>
        <input
          type="color"
          value={canvas.background}
          onChange={(event) => onChange({ background: event.currentTarget.value })}
        />
      </label>
    </div>
  );
}

function NumberField({
  label,
  field,
  canvas,
  onChange,
}: {
  readonly label: string;
  readonly field: NumericCanvasField;
  readonly canvas: CanvasSettings;
  readonly onChange: (patch: CanvasSettingsPatch) => void;
}): ReactElement {
  return (
    <label className="field-row">
      <span>{label}</span>
      <input
        type="number"
        min={MIN_EXPORT_DIMENSION}
        step={1}
        value={canvas[field]}
        onChange={(event) => updateNumberField(field, event, onChange)}
      />
    </label>
  );
}

function updateNumberField(
  field: NumericCanvasField,
  event: ChangeEvent<HTMLInputElement>,
  onChange: (patch: CanvasSettingsPatch) => void,
): void {
  if (!event.currentTarget.validity.valid || event.currentTarget.value === "") {
    return;
  }
  onChange({ [field]: Number(event.currentTarget.value) });
}

