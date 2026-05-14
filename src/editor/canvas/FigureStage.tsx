import { useState } from "react";
import type { Dispatch, ReactElement, RefObject } from "react";
import type Konva from "konva";
import { Layer, Rect, Stage } from "react-konva";
import type { Figure } from "../model/figure";
import type { Size } from "../model/geometry";
import { hasRenderableArea, normalizeRect } from "../model/geometry";
import type { PlacementGuide } from "../model/placementSnapping";
import type { ProjectAction } from "../state/projectStore";
import type { DraftRoi } from "../tools/useRoiDraftTool";
import { useRoiDraftTool } from "../tools/useRoiDraftTool";
import { CanvasResizeHandle } from "./CanvasResizeHandle";
import { ObjectRenderer } from "./ObjectRenderer";
import { PlacementGuideOverlay } from "./PlacementGuideOverlay";
import { RoiFrameRenderer } from "./RoiFrameRenderer";

interface FigureStageProps {
  readonly figure: Figure;
  readonly stageRef: RefObject<Konva.Stage | null>;
  readonly dispatch: Dispatch<ProjectAction>;
}

export function FigureStage({
  figure,
  stageRef,
  dispatch,
}: FigureStageProps): ReactElement {
  const roiDraftTool = useRoiDraftTool({ figure, stageRef, dispatch });
  const [placementGuides, setPlacementGuides] = useState<readonly PlacementGuide[]>([]);
  const [draftCanvasSize, setDraftCanvasSize] = useState<Size | null>(null);
  const displayedCanvas = draftCanvasSize ?? figure.canvas;

  return (
    <Stage
      ref={stageRef}
      width={displayedCanvas.width}
      height={displayedCanvas.height}
      onMouseDown={roiDraftTool.handlePointerDown}
      onTouchStart={roiDraftTool.handlePointerDown}
      onMouseMove={roiDraftTool.handlePointerMove}
      onTouchMove={roiDraftTool.handlePointerMove}
      onMouseUp={roiDraftTool.handlePointerUp}
      onTouchEnd={roiDraftTool.handlePointerUp}
    >
      <FigureLayer
        figure={figure}
        canvas={displayedCanvas}
        dispatch={dispatch}
        draftRoi={roiDraftTool.draftRoi}
        placementGuides={placementGuides}
        onPlacementGuidesChange={setPlacementGuides}
        onCanvasResizePreview={setDraftCanvasSize}
      />
    </Stage>
  );
}

function FigureLayer({
  figure,
  canvas,
  dispatch,
  draftRoi,
  placementGuides,
  onPlacementGuidesChange,
  onCanvasResizePreview,
}: {
  readonly figure: Figure;
  readonly canvas: Size;
  readonly dispatch: Dispatch<ProjectAction>;
  readonly draftRoi: DraftRoi | null;
  readonly placementGuides: readonly PlacementGuide[];
  readonly onPlacementGuidesChange: (guides: readonly PlacementGuide[]) => void;
  readonly onCanvasResizePreview: (size: Size | null) => void;
}): ReactElement {
  return (
    <Layer>
      <CanvasBackground canvas={canvas} background={figure.canvas.background} />
      <FigureObjects
        figure={figure}
        dispatch={dispatch}
        onPlacementGuidesChange={onPlacementGuidesChange}
      />
      <RoiFrames figure={figure} dispatch={dispatch} />
      <DraftRoiRect draftRoi={draftRoi} />
      <CanvasResizeHandle
        canvas={canvas}
        dispatch={dispatch}
        onResizePreview={onCanvasResizePreview}
      />
      <PlacementGuideOverlay canvas={canvas} guides={placementGuides} />
    </Layer>
  );
}

function CanvasBackground({
  canvas,
  background,
}: {
  readonly canvas: Size;
  readonly background: string;
}): ReactElement {
  return (
    <Rect
      name="figure-background"
      x={0}
      y={0}
      width={canvas.width}
      height={canvas.height}
      fill={background}
    />
  );
}

function FigureObjects({
  figure,
  dispatch,
  onPlacementGuidesChange,
}: {
  readonly figure: Figure;
  readonly dispatch: Dispatch<ProjectAction>;
  readonly onPlacementGuidesChange: (guides: readonly PlacementGuide[]) => void;
}): ReactElement {
  return (
    <>
      {figure.objects.map((object) => (
        <ObjectRenderer
          key={object.id}
          figure={figure}
          object={object}
          dispatch={dispatch}
          onPlacementGuidesChange={onPlacementGuidesChange}
        />
      ))}
    </>
  );
}

function RoiFrames({
  figure,
  dispatch,
}: {
  readonly figure: Figure;
  readonly dispatch: Dispatch<ProjectAction>;
}): ReactElement {
  return (
    <>
      {figure.rois.map((roi) => (
        <RoiFrameRenderer
          key={roi.id}
          figure={figure}
          roi={roi}
          dispatch={dispatch}
        />
      ))}
    </>
  );
}

function DraftRoiRect({
  draftRoi,
}: {
  readonly draftRoi: DraftRoi | null;
}): ReactElement | null {
  if (!draftRoi) {
    return null;
  }
  const rect = normalizeRect(draftRoi.start, draftRoi.current);
  if (!hasRenderableArea(rect)) {
    return null;
  }
  return (
    <Rect
      x={rect.x}
      y={rect.y}
      width={rect.width}
      height={rect.height}
      fill="rgba(225, 29, 72, 0.08)"
      stroke="#e11d48"
      strokeWidth={2}
      dash={[8, 6]}
    />
  );
}
