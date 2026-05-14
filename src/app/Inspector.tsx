import type { ReactElement } from "react";
import type { ExportPreset } from "../editor/model/exportPreset";
import type { Figure } from "../editor/model/figure";

interface InspectorProps {
  readonly figure: Figure;
  readonly pngPreset: ExportPreset | undefined;
  readonly errorMessage: string | null;
}

export function Inspector({
  figure,
  pngPreset,
  errorMessage,
}: InspectorProps): ReactElement {
  const insetCount = figure.objects.filter((object) => object.kind === "inset").length;
  return (
    <aside className="inspector">
      <InspectorMetric label="Source Images" value={figure.sourceImages.length} />
      <InspectorMetric label="ROIs" value={figure.rois.length} />
      <InspectorMetric label="Insets" value={insetCount} />
      <div className="inspector-section">
        <h2>Export Preset</h2>
        <p>{pngPreset?.name ?? "No PNG preset"}</p>
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

