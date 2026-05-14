import type { ReactElement } from "react";
import type { FigureComposerPlatform } from "../platform/appPlatform";
import { AppToolbar } from "./AppToolbar";
import { ExportDialog } from "./ExportDialog";
import { useFigureComposerController } from "./useFigureComposerController";
import { Workspace } from "./Workspace";

interface AppProps {
  readonly platform: FigureComposerPlatform;
}

export function App({ platform }: AppProps): ReactElement {
  const controller = useFigureComposerController(platform);

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
        onAddGenericAnnotation={controller.handleAddGenericAnnotation}
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
