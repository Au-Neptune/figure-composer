import type { ReactElement } from "react";
import type {
  CanvasSettingsPatch,
  Figure,
  InsetDockSide,
} from "../editor/model/figure";
import { FigureLayoutEditor } from "./FigureLayoutEditor";
import { InsetDockControls } from "./InsetDockControls";
import { SourceImageList } from "./SourceImageList";

interface InspectorProps {
  readonly figure: Figure;
  readonly errorMessage: string | null;
  readonly onCanvasSettingsChange: (patch: CanvasSettingsPatch) => void;
  readonly onDockInset: (objectId: string, side: InsetDockSide) => void;
  readonly onSelectFigureObject: (objectId: string) => void;
}

export function Inspector({
  figure,
  errorMessage,
  onCanvasSettingsChange,
  onDockInset,
  onSelectFigureObject,
}: InspectorProps): ReactElement {
  const insetCount = figure.objects.filter((object) => object.kind === "inset").length;
  return (
    <aside className="inspector">
      <InspectorMetric label="Source Images" value={figure.sourceImages.length} />
      <InspectorMetric label="ROIs" value={figure.rois.length} />
      <InspectorMetric label="Insets" value={insetCount} />
      <SourceImageList
        figure={figure}
        onSelectFigureObject={onSelectFigureObject}
      />
      <div className="inspector-section">
        <h2>Figure Layout</h2>
        <FigureLayoutEditor
          canvas={figure.canvas}
          onChange={onCanvasSettingsChange}
        />
      </div>
      <InsetDockControls figure={figure} onDockInset={onDockInset} />
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
