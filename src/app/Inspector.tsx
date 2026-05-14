import { Crop } from "lucide-react";
import type { ReactElement } from "react";
import type {
  CanvasSettingsPatch,
  Figure,
  InsetDockSide,
} from "../editor/model/figure";
import type { RegionOfInterest } from "../editor/model/roi";
import { FigureLayoutEditor } from "./FigureLayoutEditor";
import { InsetDockControls } from "./InsetDockControls";
import { SourceImageList } from "./SourceImageList";

interface InspectorProps {
  readonly figure: Figure;
  readonly errorMessage: string | null;
  readonly onCanvasSettingsChange: (patch: CanvasSettingsPatch) => void;
  readonly onDockInset: (objectId: string, side: InsetDockSide) => void;
  readonly onCreateDerivedCrop: (roiId: string) => Promise<boolean>;
  readonly onSelectFigureObject: (objectId: string) => void;
  readonly onRenameSourceImage: (sourceImageId: string, name: string) => boolean;
  readonly onDeleteSourceImage: (sourceImageId: string) => boolean;
}

export function Inspector({
  figure,
  errorMessage,
  onCanvasSettingsChange,
  onDockInset,
  onCreateDerivedCrop,
  onSelectFigureObject,
  onRenameSourceImage,
  onDeleteSourceImage,
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
        onRenameSourceImage={onRenameSourceImage}
        onDeleteSourceImage={onDeleteSourceImage}
      />
      <div className="inspector-section">
        <h2>Figure Layout</h2>
        <FigureLayoutEditor
          canvas={figure.canvas}
          onChange={onCanvasSettingsChange}
        />
      </div>
      <InsetDockControls figure={figure} onDockInset={onDockInset} />
      <RoiCropControls figure={figure} onCreateDerivedCrop={onCreateDerivedCrop} />
      {errorMessage ? <p className="error-message">{errorMessage}</p> : null}
    </aside>
  );
}

function RoiCropControls({
  figure,
  onCreateDerivedCrop,
}: {
  readonly figure: Figure;
  readonly onCreateDerivedCrop: (roiId: string) => Promise<boolean>;
}): ReactElement | null {
  const roi = getSelectedRoi(figure);
  if (!roi) {
    return null;
  }
  return (
    <div className="inspector-section">
      <h2>Region Of Interest</h2>
      <button
        className="small-button"
        type="button"
        onClick={() => {
          void onCreateDerivedCrop(roi.id);
        }}
      >
        <Crop size={15} aria-hidden="true" />
        <span>Create Derived Source</span>
      </button>
    </div>
  );
}

function getSelectedRoi(figure: Figure): RegionOfInterest | null {
  return figure.rois.find((roi) => roi.id === figure.selectedRoiId) ?? null;
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
