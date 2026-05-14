import type { ChangeEvent, ReactElement } from "react";
import type {
  ExportFormat,
  ExportPreset,
  ExportPresetPatch,
} from "../editor/model/exportPreset";
import {
  JPG_QUALITY_STEP,
  MAX_JPG_QUALITY,
  MIN_EXPORT_DPI,
  MIN_JPG_QUALITY,
} from "../editor/state/editorDefaults";

const PERCENT_SCALE = 100;
type NumberPresetField = "dpi";
type NumericPresetField = NumberPresetField | "jpgQuality";

interface ExportPresetEditorProps {
  readonly preset: ExportPreset;
  readonly onChange: (patch: ExportPresetPatch) => void;
}

export function ExportPresetEditor({
  preset,
  onChange,
}: ExportPresetEditorProps): ReactElement {
  return (
    <div className="preset-editor">
      <NumberField label="DPI" field="dpi" preset={preset} onChange={onChange} />
      <FormatField value={preset.format} onChange={onChange} />
      {preset.format === "jpg" ? (
        <JpgQualityField preset={preset} onChange={onChange} />
      ) : null}
    </div>
  );
}

function NumberField({
  label,
  field,
  preset,
  onChange,
}: {
  readonly label: string;
  readonly field: NumberPresetField;
  readonly preset: ExportPreset;
  readonly onChange: (patch: ExportPresetPatch) => void;
}): ReactElement {
  return (
    <label className="field-row">
      <span>{label}</span>
      <input
        type="number"
        min={MIN_EXPORT_DPI}
        step={1}
        value={preset[field]}
        onChange={(event) => updateNumberField(field, event, onChange)}
      />
    </label>
  );
}

function FormatField({
  value,
  onChange,
}: {
  readonly value: ExportFormat;
  readonly onChange: (patch: ExportPresetPatch) => void;
}): ReactElement {
  return (
    <label className="field-row">
      <span>Format</span>
      <select
        value={value}
        onChange={(event) => onChange({ format: event.currentTarget.value as ExportFormat })}
      >
        <option value="png">PNG</option>
        <option value="jpg">JPG</option>
      </select>
    </label>
  );
}

function JpgQualityField({
  preset,
  onChange,
}: {
  readonly preset: ExportPreset;
  readonly onChange: (patch: ExportPresetPatch) => void;
}): ReactElement {
  return (
    <label className="field-row">
      <span>JPG Quality</span>
      <span className="range-field">
        <input
          type="range"
          min={MIN_JPG_QUALITY}
          max={MAX_JPG_QUALITY}
          step={JPG_QUALITY_STEP}
          value={preset.jpgQuality}
          onChange={(event) => updateNumberField("jpgQuality", event, onChange)}
        />
        <output>{formatJpgQuality(preset.jpgQuality)}</output>
      </span>
    </label>
  );
}

function updateNumberField(
  field: NumericPresetField,
  event: ChangeEvent<HTMLInputElement>,
  onChange: (patch: ExportPresetPatch) => void,
): void {
  if (!event.currentTarget.validity.valid || event.currentTarget.value === "") {
    return;
  }
  onChange({ [field]: Number(event.currentTarget.value) });
}

function formatJpgQuality(value: number): string {
  return `${Math.round(value * PERCENT_SCALE)}%`;
}
