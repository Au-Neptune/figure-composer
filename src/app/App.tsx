import type { ReactElement } from "react";
import { AppToolbar } from "./AppToolbar";
import { ExportDialog } from "./ExportDialog";
import { useFigureComposerController } from "./useFigureComposerController";
import { Workspace } from "./Workspace";

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
      />
      <Workspace controller={controller} />
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
