import type { ReactElement } from "react";
import { FigureStage } from "../editor/canvas/FigureStage";
import { AppToolbar } from "./AppToolbar";
import { ExportDialog } from "./ExportDialog";
import { Inspector } from "./Inspector";
import { SelectionPanel } from "./SelectionPanel";
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

function Workspace({
  controller,
}: {
  readonly controller: ReturnType<typeof useFigureComposerController>;
}): ReactElement {
  return (
    <section className="workspace">
      <Inspector
        figure={controller.figure}
        errorMessage={controller.errorMessage}
        onCanvasSettingsChange={controller.handleCanvasSettingsChange}
        onDockInset={controller.handleDockInset}
        onCreateDerivedCrop={controller.handleCreateDerivedCrop}
        onDeleteRoi={controller.handleDeleteRoi}
        onSelectFigureObject={controller.handleSelectFigureObject}
        onRenameSourceImage={controller.handleRenameSourceImage}
        onDeleteSourceImage={controller.handleDeleteSourceImage}
      />
      <div className="stage-viewport">
        <FigureStage
          figure={controller.figure}
          stageRef={controller.stageRef}
          dispatch={controller.dispatchProjectAction}
        />
      </div>
      <SelectionPanel
        figure={controller.figure}
        onObjectBoundsChange={controller.handleFigureObjectBoundsChange}
      />
    </section>
  );
}
