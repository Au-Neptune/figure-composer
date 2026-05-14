import { useReducer, useRef, useState } from "react";
import type { ChangeEvent, Dispatch, RefObject } from "react";
import type Konva from "konva";
import { exportStageAsFigure } from "../editor/export/exportFigure";
import type { ExportPreset, ExportPresetPatch } from "../editor/model/exportPreset";
import type { Figure, ToolMode } from "../editor/model/figure";
import { revokeHistoryAssetUrls } from "../editor/project/assetUrls";
import {
  canRedo,
  canUndo,
  createInitialHistory,
  historyReducer,
  type HistoryState,
} from "../editor/state/historyStore";
import type { ProjectAction } from "../editor/state/projectStore";
import { readImageFile } from "../platform/browser/fileAdapter";
import {
  openProjectFolder,
  saveProjectFolder,
} from "../platform/browser/projectFolderAdapter";
import { useEditorShortcuts } from "./useEditorShortcuts";

export interface FigureComposerController {
  readonly figure: Figure;
  readonly exportPreset: ExportPreset;
  readonly errorMessage: string | null;
  readonly stageRef: RefObject<Konva.Stage | null>;
  readonly undoAvailable: boolean;
  readonly redoAvailable: boolean;
  readonly dispatchProjectAction: (action: ProjectAction) => void;
  readonly handleImport: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  readonly handleOpenProject: () => Promise<void>;
  readonly handleSaveProject: () => Promise<void>;
  readonly handleUndo: () => void;
  readonly handleRedo: () => void;
  readonly handleToolChange: (tool: ToolMode) => void;
  readonly handleExportFigure: () => void;
  readonly handleExportPresetChange: (patch: ExportPresetPatch) => void;
}

export function useFigureComposerController(): FigureComposerController {
  const [history, dispatch] = useReducer(
    historyReducer,
    undefined,
    createInitialHistory,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const figure = history.present;
  const exportPreset = getPrimaryExportPreset(figure.exportPresets);
  const handleUndo = () => dispatch({ type: "undoRequested" });
  const handleRedo = () => dispatch({ type: "redoRequested" });
  const undoAvailable = canUndo(history);
  const redoAvailable = canRedo(history);

  useEditorShortcuts({
    canUndo: undoAvailable,
    canRedo: redoAvailable,
    onUndo: handleUndo,
    onRedo: handleRedo,
  });

  return {
    figure,
    exportPreset,
    errorMessage,
    stageRef,
    undoAvailable,
    redoAvailable,
    dispatchProjectAction: (action) => dispatch(action),
    handleImport: createImportHandler(dispatch, setErrorMessage),
    handleOpenProject: createOpenProjectHandler(dispatch, setErrorMessage, history),
    handleSaveProject: () => runWithVisibleError(() => saveProjectFolder(figure), setErrorMessage),
    handleUndo,
    handleRedo,
    handleToolChange: (tool) => dispatch({ type: "toolChanged", tool }),
    handleExportFigure: () => exportFigure(stageRef.current, exportPreset),
    handleExportPresetChange: (patch) =>
      dispatch({ type: "exportPresetChanged", presetId: exportPreset.id, patch }),
  };
}

function getPrimaryExportPreset(exportPresets: readonly ExportPreset[]): ExportPreset {
  const preset = exportPresets[0];
  if (!preset) {
    throw new Error("A Figure requires at least one Export Preset.");
  }
  return preset;
}

function createImportHandler(
  dispatch: Dispatch<ProjectAction>,
  setErrorMessage: (message: string | null) => void,
) {
  return async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    for (const file of files) {
      const imported = await runWithVisibleError(() => readImageFile(file), setErrorMessage);
      dispatch({ type: "sourceImageImported", imported });
    }
  };
}

function createOpenProjectHandler(
  dispatch: Dispatch<ProjectAction>,
  setErrorMessage: (message: string | null) => void,
  history: HistoryState,
) {
  return async () => {
    const openedFigure = await runWithVisibleError(openProjectFolder, setErrorMessage);
    dispatch({ type: "projectOpened", figure: openedFigure });
    revokeHistoryAssetUrls(history);
  };
}

function exportFigure(stage: Konva.Stage | null, preset: ExportPreset): void {
  if (!stage) {
    throw new Error("Figure export requires a mounted Figure Stage.");
  }
  exportStageAsFigure(stage, { fileBasename: "figure-composer-export", preset });
}

async function runWithVisibleError<T>(
  action: () => Promise<T>,
  setErrorMessage: (message: string | null) => void,
): Promise<T> {
  try {
    setErrorMessage(null);
    return await action();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setErrorMessage(message);
    throw error;
  }
}
