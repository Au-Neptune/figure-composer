import type { ReactElement } from "react";
import { FigureStage } from "../editor/canvas/FigureStage";
import { AppToolbar } from "./AppToolbar";
import { ExportDialog } from "./ExportDialog";
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
        onExportFigure={controller.handleOpenExportDialog}
        exportLabel={controller.exportPreset.format.toUpperCase()}
      />
      <section className="workspace">
        <Inspector
          figure={controller.figure}
          errorMessage={controller.errorMessage}
          onCanvasSettingsChange={controller.handleCanvasSettingsChange}
          onDockInset={controller.handleDockInset}
          onSelectFigureObject={controller.handleSelectFigureObject}
        />
        <div className="stage-viewport">
          <FigureStage
            figure={controller.figure}
            stageRef={controller.stageRef}
            dispatch={controller.dispatchProjectAction}
          />
        </div>
      </section>
      {controller.exportDialogOpen ? (
        <ExportDialog
          figure={controller.figure}
          preset={controller.exportPreset}
          onChange={controller.handleExportPresetChange}
          onCancel={controller.handleCloseExportDialog}
          onConfirm={controller.handleConfirmExportFigure}
        />
      ) : null}
    </main>
  );
}
