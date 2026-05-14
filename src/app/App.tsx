import type { ReactElement } from "react";
import { FigureStage } from "../editor/canvas/FigureStage";
import { AppToolbar } from "./AppToolbar";
import { Inspector } from "./Inspector";
import { useFigureComposerController } from "./useFigureComposerController";

export function App(): ReactElement {
  const controller = useFigureComposerController();

  return (
    <main className="app-shell">
      <AppToolbar
        activeTool={controller.figure.tool}
        onImport={controller.handleImport}
        onOpenProject={controller.handleOpenProject}
        onSaveProject={controller.handleSaveProject}
        onUndo={controller.handleUndo}
        onRedo={controller.handleRedo}
        canUndo={controller.undoAvailable}
        canRedo={controller.redoAvailable}
        onToolChange={controller.handleToolChange}
        onExportFigure={controller.handleExportFigure}
        exportLabel={controller.exportPreset.format.toUpperCase()}
      />
      <section className="workspace">
        <Inspector
          figure={controller.figure}
          exportPreset={controller.exportPreset}
          errorMessage={controller.errorMessage}
          onExportPresetChange={controller.handleExportPresetChange}
        />
        <div className="stage-viewport">
          <FigureStage
            figure={controller.figure}
            stageRef={controller.stageRef}
            dispatch={controller.dispatchProjectAction}
          />
        </div>
      </section>
    </main>
  );
}
