import { useReducer, useRef, useState } from "react";
import type { ChangeEvent, Dispatch, RefObject } from "react";
import type Konva from "konva";
import { exportStageAsFigure } from "../editor/export/exportFigure";
import { syncExportPresetToCanvas } from "../editor/export/exportPresetSync";
import type { ExportPreset, ExportPresetPatch } from "../editor/model/exportPreset";
import type {
  CanvasSettingsPatch,
  Figure,
  InsetDockSide,
  ToolMode,
} from "../editor/model/figure";
import type { Rect } from "../editor/model/geometry";
import { getFigureObject } from "../editor/model/selectors";
import { revokeHistoryAssetUrls } from "../editor/project/assetUrls";
import {
  canRedo,
  canUndo,
  createInitialHistory,
  historyReducer,
  type HistoryAction,
  type HistoryState,
} from "../editor/state/historyStore";
import type { ProjectAction } from "../editor/state/projectStore";
import {
  openProjectFolder,
  saveProjectFolder,
} from "../platform/browser/projectFolderAdapter";
import {
  createFileInputImportHandler,
  createImportFilesHandler,
} from "./sourceImageImport";
import {
  createDeleteSourceImageHandler,
  createDerivedCropHandler,
  createRenameSourceImageHandler,
} from "./sourceImageHandlers";
import { useEditorShortcuts } from "./useEditorShortcuts";
import { runWithVisibleCommand, runWithVisibleError } from "./visibleErrors";

export interface FigureComposerController {
  readonly figure: Figure;
  readonly exportPreset: ExportPreset;
  readonly errorMessage: string | null;
  readonly stageRef: RefObject<Konva.Stage | null>;
  readonly undoAvailable: boolean;
  readonly redoAvailable: boolean;
  readonly exportDialogOpen: boolean;
  readonly dispatchProjectAction: (action: ProjectAction) => void;
  readonly handleImport: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  readonly handleImportFiles: (files: readonly File[]) => Promise<void>;
  readonly handleOpenProject: () => Promise<void>;
  readonly handleSaveProject: () => Promise<void>;
  readonly handleUndo: () => void;
  readonly handleRedo: () => void;
  readonly handleToolChange: (tool: ToolMode) => void;
  readonly handleOpenExportDialog: () => void;
  readonly handleCloseExportDialog: () => void;
  readonly handleConfirmExportFigure: () => void;
  readonly handleCanvasSettingsChange: (patch: CanvasSettingsPatch) => void;
  readonly handleDockInset: (objectId: string, side: InsetDockSide) => void;
  readonly handleSelectFigureObject: (objectId: string) => void;
  readonly handleFigureObjectBoundsChange: (
    objectId: string,
    patch: FigureObjectBoundsPatch,
  ) => void;
  readonly handleCreateDerivedCrop: (roiId: string) => Promise<boolean>;
  readonly handleDeleteRoi: (roiId: string) => boolean;
  readonly handleRenameSourceImage: (
    sourceImageId: string,
    name: string,
  ) => boolean;
  readonly handleDeleteSourceImage: (sourceImageId: string) => boolean;
  readonly handleExportPresetChange: (patch: ExportPresetPatch) => void;
}

type FigureComposerHandlers = Omit<
  FigureComposerController,
  | "figure"
  | "exportPreset"
  | "errorMessage"
  | "stageRef"
  | "undoAvailable"
  | "redoAvailable"
  | "exportDialogOpen"
>;

type FigureObjectBoundsPatch = Partial<Pick<Rect, "x" | "y" | "width" | "height">>;

interface ControllerHandlerOptions {
  readonly figure: Figure;
  readonly exportPreset: ExportPreset;
  readonly history: HistoryState;
  readonly dispatch: Dispatch<HistoryAction>;
  readonly setErrorMessage: (message: string | null) => void;
  readonly setExportDialogOpen: (open: boolean) => void;
  readonly stageRef: RefObject<Konva.Stage | null>;
}

export function useFigureComposerController(): FigureComposerController {
  const [history, dispatch] = useReducer(
    historyReducer,
    undefined,
    createInitialHistory,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const stageRef = useRef<Konva.Stage>(null);
  const figure = history.present;
  const exportPreset = syncExportPresetToCanvas(
    getPrimaryExportPreset(figure.exportPresets),
    figure.canvas,
  );
  const undoAvailable = canUndo(history);
  const redoAvailable = canRedo(history);

  useEditorShortcuts({
    canUndo: undoAvailable,
    canRedo: redoAvailable,
    onUndo: () => dispatch({ type: "undoRequested" }),
    onRedo: () => dispatch({ type: "redoRequested" }),
  });

  return {
    figure,
    exportPreset,
    errorMessage,
    stageRef,
    undoAvailable,
    redoAvailable,
    exportDialogOpen,
    ...createControllerHandlers({
      figure,
      exportPreset,
      history,
      dispatch,
      setErrorMessage,
      setExportDialogOpen,
      stageRef,
    }),
  };
}

function createControllerHandlers({
  figure,
  exportPreset,
  history,
  dispatch,
  setErrorMessage,
  setExportDialogOpen,
  stageRef,
}: ControllerHandlerOptions): FigureComposerHandlers {
  const importFiles = createImportFilesHandler(dispatch, setErrorMessage);
  return {
    dispatchProjectAction: (action) => dispatch(action),
    handleImport: createFileInputImportHandler(importFiles),
    handleImportFiles: importFiles,
    handleOpenProject: createOpenProjectHandler(dispatch, setErrorMessage, history),
    handleSaveProject: () => runWithVisibleError(() => saveProjectFolder(figure), setErrorMessage),
    handleUndo: () => dispatch({ type: "undoRequested" }),
    handleRedo: () => dispatch({ type: "redoRequested" }),
    handleToolChange: (tool) => dispatch({ type: "toolChanged", tool }),
    ...createExportHandlers({ exportPreset, dispatch, setExportDialogOpen, stageRef }),
    handleCanvasSettingsChange: (patch) => dispatch({ type: "canvasSettingsChanged", patch }),
    handleDockInset: (objectId, side) => dispatch({ type: "insetDocked", objectId, side }),
    handleSelectFigureObject: (objectId) => dispatch({ type: "figureObjectSelected", objectId }),
    handleFigureObjectBoundsChange: (objectId, patch) => dispatchObjectBoundsChange({ figure, dispatch, objectId, patch }),
    handleCreateDerivedCrop: createDerivedCropHandler({
      figure,
      dispatch,
      setErrorMessage,
    }),
    handleDeleteRoi: (roiId) =>
      runWithVisibleCommand(() => {
        dispatch({ type: "roiDeleted", roiId });
      }, setErrorMessage),
    handleRenameSourceImage: createRenameSourceImageHandler({
      figure,
      dispatch,
      setErrorMessage,
    }),
    handleDeleteSourceImage: createDeleteSourceImageHandler({
      figure,
      dispatch,
      setErrorMessage,
    }),
  };
}

function createExportHandlers({
  exportPreset,
  dispatch,
  setExportDialogOpen,
  stageRef,
}: {
  readonly exportPreset: ExportPreset;
  readonly dispatch: Dispatch<HistoryAction>;
  readonly setExportDialogOpen: (open: boolean) => void;
  readonly stageRef: RefObject<Konva.Stage | null>;
}): Pick<
  FigureComposerHandlers,
  | "handleOpenExportDialog"
  | "handleCloseExportDialog"
  | "handleConfirmExportFigure"
  | "handleExportPresetChange"
> {
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

function dispatchObjectBoundsChange({
  figure,
  dispatch,
  objectId,
  patch,
}: {
  readonly figure: Figure;
  readonly dispatch: Dispatch<HistoryAction>;
  readonly objectId: string;
  readonly patch: FigureObjectBoundsPatch;
}): void {
  const object = getFigureObject(figure, objectId);
  const bounds = { ...object, ...patch };
  if ("width" in patch || "height" in patch) {
    dispatch({ type: "figureObjectResized", objectId, bounds });
    return;
  }
  dispatch({ type: "figureObjectMoved", objectId, x: bounds.x, y: bounds.y });
}

function getPrimaryExportPreset(exportPresets: readonly ExportPreset[]): ExportPreset {
  const preset = exportPresets[0];
  if (!preset) {
    throw new Error("A Figure requires at least one Export Preset.");
  }
  return preset;
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
