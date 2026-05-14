import { useState } from "react";
import type { Dispatch, ReactElement, RefObject } from "react";
import type Konva from "konva";
import { Layer, Rect, Stage } from "react-konva";
import type { Figure } from "../model/figure";
import { hasRenderableArea, normalizeRect } from "../model/geometry";
import type { PlacementGuide } from "../model/placementSnapping";
import type { ProjectAction } from "../state/projectStore";
import type { DraftRoi } from "../tools/useRoiDraftTool";
import { useRoiDraftTool } from "../tools/useRoiDraftTool";
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

  return (
    <Stage
      ref={stageRef}
      width={figure.canvas.width}
      height={figure.canvas.height}
      onMouseDown={roiDraftTool.handlePointerDown}
      onTouchStart={roiDraftTool.handlePointerDown}
      onMouseMove={roiDraftTool.handlePointerMove}
      onTouchMove={roiDraftTool.handlePointerMove}
      onMouseUp={roiDraftTool.handlePointerUp}
      onTouchEnd={roiDraftTool.handlePointerUp}
    >
      <FigureLayer
        figure={figure}
        dispatch={dispatch}
        draftRoi={roiDraftTool.draftRoi}
        placementGuides={placementGuides}
        onPlacementGuidesChange={setPlacementGuides}
      />
    </Stage>
  );
}

function FigureLayer({
  figure,
  dispatch,
  draftRoi,
  placementGuides,
  onPlacementGuidesChange,
}: {
  readonly figure: Figure;
  readonly dispatch: Dispatch<ProjectAction>;
  readonly draftRoi: DraftRoi | null;
  readonly placementGuides: readonly PlacementGuide[];
  readonly onPlacementGuidesChange: (guides: readonly PlacementGuide[]) => void;
}): ReactElement {
  return (
    <Layer>
      <Rect
        name="figure-background"
        x={0}
        y={0}
        width={figure.canvas.width}
        height={figure.canvas.height}
        fill={figure.canvas.background}
      />
      {figure.objects.map((object) => (
        <ObjectRenderer
          key={object.id}
          figure={figure}
          object={object}
          dispatch={dispatch}
          onPlacementGuidesChange={onPlacementGuidesChange}
        />
      ))}
      {figure.rois.map((roi) => (
        <RoiFrameRenderer
          key={roi.id}
          figure={figure}
          roi={roi}
          dispatch={dispatch}
        />
      ))}
      <DraftRoiRect draftRoi={draftRoi} />
      <PlacementGuideOverlay canvas={figure.canvas} guides={placementGuides} />
    </Layer>
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
