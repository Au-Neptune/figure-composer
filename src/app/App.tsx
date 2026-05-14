import { useReducer, useRef, useState } from "react";
import type { ChangeEvent, ReactElement } from "react";
import type Konva from "konva";
import { FigureStage } from "../editor/canvas/FigureStage";
import { exportStageAsFigure } from "../editor/export/exportFigure";
import type { ExportPreset, ExportPresetPatch } from "../editor/model/exportPreset";
import type { ToolMode } from "../editor/model/figure";
import {
  createInitialProject,
  projectReducer,
} from "../editor/state/projectStore";
import { readImageFile } from "../platform/browser/fileAdapter";
import {
  openProjectFolder,
  saveProjectFolder,
} from "../platform/browser/projectFolderAdapter";
import { revokeFigureAssetUrls } from "../editor/project/assetUrls";
import { AppToolbar } from "./AppToolbar";
import { Inspector } from "./Inspector";

export function App(): ReactElement {
  const [figure, dispatch] = useReducer(projectReducer, undefined, createInitialProject);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const exportPreset = getPrimaryExportPreset(figure.exportPresets);

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    for (const file of files) {
      const imported = await readImageWithVisibleError(file, setErrorMessage);
      dispatch({ type: "sourceImageImported", imported });
    }
  };

  const handleOpenProject = async () => {
    const openedFigure = await runWithVisibleError(openProjectFolder, setErrorMessage);
    dispatch({ type: "projectOpened", figure: openedFigure });
    revokeFigureAssetUrls(figure);
  };

  const handleSaveProject = async () => {
    await runWithVisibleError(() => saveProjectFolder(figure), setErrorMessage);
  };

  const handleExportFigure = () => {
    const stage = stageRef.current;
    if (!stage) {
      throw new Error("Figure export requires a mounted Figure Stage.");
    }
    exportStageAsFigure(stage, {
      fileBasename: "figure-composer-export",
      preset: exportPreset,
    });
  };

  const handleToolChange = (tool: ToolMode) => {
    dispatch({ type: "toolChanged", tool });
  };

  const handleExportPresetChange = (patch: ExportPresetPatch) => {
    dispatch({ type: "exportPresetChanged", presetId: exportPreset.id, patch });
  };

  return (
    <main className="app-shell">
      <AppToolbar
        activeTool={figure.tool}
        onImport={handleImport}
        onOpenProject={handleOpenProject}
        onSaveProject={handleSaveProject}
        onToolChange={handleToolChange}
        onExportFigure={handleExportFigure}
        exportLabel={exportPreset.format.toUpperCase()}
      />
      <section className="workspace">
        <Inspector
          figure={figure}
          exportPreset={exportPreset}
          errorMessage={errorMessage}
          onExportPresetChange={handleExportPresetChange}
        />
        <div className="stage-viewport">
          <FigureStage figure={figure} stageRef={stageRef} dispatch={dispatch} />
        </div>
      </section>
    </main>
  );
}

function getPrimaryExportPreset(exportPresets: readonly ExportPreset[]): ExportPreset {
  const preset = exportPresets[0];
  if (!preset) {
    throw new Error("A Figure requires at least one Export Preset.");
  }
  return preset;
}

async function readImageWithVisibleError(
  file: File,
  setErrorMessage: (message: string | null) => void,
) {
  return runWithVisibleError(() => readImageFile(file), setErrorMessage);
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
