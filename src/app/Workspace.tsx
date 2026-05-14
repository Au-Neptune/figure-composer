import type { ReactElement } from "react";
import { FigureStage } from "../editor/canvas/FigureStage";
import type { FigureComposerController } from "./useFigureComposerController";
import { Inspector } from "./Inspector";
import { SelectionPanel } from "./SelectionPanel";
import { useWorkspaceImageDrop } from "./useWorkspaceImageDrop";
import { useWorkspacePanelSizing } from "./useWorkspacePanelSizing";
import "./Workspace.css";

interface WorkspaceProps {
  readonly controller: FigureComposerController;
}

export function Workspace({ controller }: WorkspaceProps): ReactElement {
  const sizing = useWorkspacePanelSizing();
  const imageDrop = useWorkspaceImageDrop(controller.handleImportFiles);
  return (
    <section
      className={imageDrop.dropActive ? "workspace is-drop-active" : "workspace"}
      style={{ gridTemplateColumns: sizing.gridTemplateColumns }}
      onDragEnter={imageDrop.handleDragEnter}
      onDragOver={imageDrop.handleDragOver}
      onDragLeave={imageDrop.handleDragLeave}
      onDrop={imageDrop.handleDrop}
    >
      <Inspector
        figure={controller.figure}
        errorMessage={controller.errorMessage}
        onCanvasSettingsChange={controller.handleCanvasSettingsChange}
        onDockInset={controller.handleDockInset}
        onDeleteRoi={controller.handleDeleteRoi}
        onCropRoiToSourceImage={controller.handleCropRoiToSourceImage}
        onSelectFigureObject={controller.handleSelectFigureObject}
        onRenameSourceImage={controller.handleRenameSourceImage}
        onDeleteSourceImage={controller.handleDeleteSourceImage}
        onResizeSourceImage={controller.handleResizeSourceImage}
        onRotateSourceImage={controller.handleRotateSourceImage}
      />
      <WorkspaceSplitter side="left" onPointerDown={sizing.startPanelResize} />
      <div className="stage-viewport">
        <FigureStage
          figure={controller.figure}
          stageRef={controller.stageRef}
          dispatch={controller.dispatchProjectAction}
        />
      </div>
      <WorkspaceSplitter side="right" onPointerDown={sizing.startPanelResize} />
      <SelectionPanel
        figure={controller.figure}
        onObjectBoundsChange={controller.handleFigureObjectBoundsChange}
        onAnnotationTextChange={controller.handleAnnotationTextChange}
      />
    </section>
  );
}

function WorkspaceSplitter({
  side,
  onPointerDown,
}: {
  readonly side: "left" | "right";
  readonly onPointerDown: (side: "left" | "right", event: React.PointerEvent) => void;
}): ReactElement {
  return (
    <button
      className="workspace-splitter"
      type="button"
      aria-label={`Resize ${side} panel`}
      onPointerDown={(event) => onPointerDown(side, event)}
    />
  );
}
