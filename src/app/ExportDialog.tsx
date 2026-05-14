import type { ReactElement } from "react";
import type { ExportPreset, ExportPresetPatch } from "../editor/model/exportPreset";
import type { Figure } from "../editor/model/figure";
import { ExportPresetEditor } from "./ExportPresetEditor";

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
  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="export-dialog" role="dialog" aria-modal="true">
        <header className="dialog-header">
          <h2>Export Figure</h2>
          <button className="icon-button" type="button" onClick={onCancel}>
            ×
          </button>
        </header>
        <div className="dialog-body">
          <dl className="export-summary">
            <dt>Figure Size</dt>
            <dd>
              {figure.canvas.width} × {figure.canvas.height}
            </dd>
            <dt>Background</dt>
            <dd>{figure.canvas.background}</dd>
          </dl>
          <ExportPresetEditor preset={preset} onChange={onChange} />
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

