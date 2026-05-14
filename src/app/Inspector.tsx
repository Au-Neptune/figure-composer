import type { ReactElement } from "react";
import type { ExportPreset, ExportPresetPatch } from "../editor/model/exportPreset";
import type { Figure } from "../editor/model/figure";
import { ExportPresetEditor } from "./ExportPresetEditor";

interface InspectorProps {
  readonly figure: Figure;
  readonly exportPreset: ExportPreset;
  readonly errorMessage: string | null;
  readonly onExportPresetChange: (patch: ExportPresetPatch) => void;
}

export function Inspector({
  figure,
  exportPreset,
  errorMessage,
  onExportPresetChange,
}: InspectorProps): ReactElement {
  const insetCount = figure.objects.filter((object) => object.kind === "inset").length;
  return (
    <aside className="inspector">
      <InspectorMetric label="Source Images" value={figure.sourceImages.length} />
      <InspectorMetric label="ROIs" value={figure.rois.length} />
      <InspectorMetric label="Insets" value={insetCount} />
      <div className="inspector-section">
        <h2>Export Preset</h2>
        <ExportPresetEditor
          preset={exportPreset}
          onChange={onExportPresetChange}
        />
      </div>
      {errorMessage ? <p className="error-message">{errorMessage}</p> : null}
    </aside>
  );
}

function InspectorMetric({
  label,
  value,
}: {
  readonly label: string;
  readonly value: number;
}): ReactElement {
  return (
    <div className="metric-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
