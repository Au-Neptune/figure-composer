import { X } from "lucide-react";
import type { ReactElement } from "react";
import { createExportPreviewMetrics } from "../editor/export/exportPreview";
import type { ExportPreset, ExportPresetPatch } from "../editor/model/exportPreset";
import type { Figure } from "../editor/model/figure";
import "./ExportDialog.css";
import { ExportPresetEditor } from "./ExportPresetEditor";
import { ExportPreview } from "./ExportPreview";

const EXPORT_PREVIEW_MAX_SIZE = { width: 360, height: 240 };

interface ExportDialogProps {
  readonly figure: Figure;
  readonly preset: ExportPreset;
  readonly onChange: (patch: ExportPresetPatch) => void;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

export function ExportDialog({
  figure,
  preset,
  onChange,
  onCancel,
  onConfirm,
}: ExportDialogProps): ReactElement {
  const metrics = createExportPreviewMetrics({
    figureSize: figure.canvas,
    preset,
    maxPreviewSize: EXPORT_PREVIEW_MAX_SIZE,
  });
  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="export-dialog" role="dialog" aria-modal="true">
        <header className="dialog-header">
          <h2>Export Figure</h2>
          <button
            className="icon-button"
            type="button"
            aria-label="Close export dialog"
            onClick={onCancel}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </header>
        <div className="dialog-body">
          <div className="export-preview-panel">
            <ExportPreview figure={figure} metrics={metrics} />
            <ExportSummary figure={figure} metrics={metrics} />
          </div>
          <div className="export-settings-panel">
            <ExportPresetEditor preset={preset} onChange={onChange} />
          </div>
        </div>
        <footer className="dialog-actions">
          <button className="small-button" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary-button" type="button" onClick={onConfirm}>
            Export {preset.format.toUpperCase()}
          </button>
        </footer>
      </section>
    </div>
  );
}

function ExportSummary({
  figure,
  metrics,
}: {
  readonly figure: Figure;
  readonly metrics: ReturnType<typeof createExportPreviewMetrics>;
}): ReactElement {
  return (
    <dl className="export-summary">
      <dt>Figure Layout</dt>
      <dd>
        {figure.canvas.width} x {figure.canvas.height}
      </dd>
      <dt>Output Size</dt>
      <dd>
        {metrics.outputSize.width} x {metrics.outputSize.height}
      </dd>
      <dt>Final Pixels</dt>
      <dd>
        {metrics.finalPixelSize.width} x {metrics.finalPixelSize.height}
      </dd>
    </dl>
  );
}
