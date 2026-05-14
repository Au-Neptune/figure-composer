import type { Dispatch, RefObject } from "react";
import type Konva from "konva";
import { exportStageAsFigure } from "../editor/export/exportFigure";
import type { ExportPreset, ExportPresetPatch } from "../editor/model/exportPreset";
import type { HistoryAction } from "../editor/state/historyStore";

interface ExportFigureHandlerOptions {
  readonly exportPreset: ExportPreset;
  readonly dispatch: Dispatch<HistoryAction>;
  readonly setExportDialogOpen: (open: boolean) => void;
  readonly stageRef: RefObject<Konva.Stage | null>;
}

export interface ExportFigureHandlers {
  readonly handleOpenExportDialog: () => void;
  readonly handleCloseExportDialog: () => void;
  readonly handleConfirmExportFigure: () => void;
  readonly handleExportPresetChange: (patch: ExportPresetPatch) => void;
}

export function createExportHandlers({
  exportPreset,
  dispatch,
  setExportDialogOpen,
  stageRef,
}: ExportFigureHandlerOptions): ExportFigureHandlers {
  return {
    handleOpenExportDialog: () => setExportDialogOpen(true),
    handleCloseExportDialog: () => setExportDialogOpen(false),
    handleConfirmExportFigure: () => {
      exportFigure(stageRef.current, exportPreset);
      setExportDialogOpen(false);
    },
    handleExportPresetChange: (patch) =>
      dispatch({ type: "exportPresetChanged", presetId: exportPreset.id, patch }),
  };
}

function exportFigure(stage: Konva.Stage | null, preset: ExportPreset): void {
  if (!stage) {
    throw new Error("Figure export requires a mounted Figure Stage.");
  }
  exportStageAsFigure(stage, { fileBasename: "figure-composer-export", preset });
}
