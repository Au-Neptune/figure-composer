import { useState } from "react";
import type { Dispatch, RefObject } from "react";
import type Konva from "konva";
import type { Figure } from "../model/figure";
import type { Point } from "../model/geometry";
import { normalizeRect } from "../model/geometry";
import { findTopSourceImageAtPoint } from "../model/selectors";
import { MIN_ROI_SIDE_PX } from "../state/editorDefaults";
import type { ProjectAction } from "../state/projectStore";
import { getStagePointer } from "./toolEvents";

export interface DraftRoi {
  readonly sourceObjectId: string;
  readonly start: Point;
  readonly current: Point;
}

interface UseRoiDraftToolOptions {
  readonly figure: Figure;
  readonly stageRef: RefObject<Konva.Stage | null>;
  readonly dispatch: Dispatch<ProjectAction>;
}

export function useRoiDraftTool({
  figure,
  stageRef,
  dispatch,
}: UseRoiDraftToolOptions) {
  const [draftRoi, setDraftRoi] = useState<DraftRoi | null>(null);
  const handlePointerDown = (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    const stage = getMountedStage(stageRef);
    const pointer = getStagePointer(stage);
    if (figure.tool === "roi") {
      setDraftRoi(createDraftRoi(figure, pointer));
      return;
    }
    if (isBackgroundClick(stage, event)) {
      dispatch({ type: "figureObjectSelected", objectId: null });
    }
  };

  const handlePointerMove = () => {
    const stage = stageRef.current;
    if (!stage || !draftRoi) {
      return;
    }
    setDraftRoi({ ...draftRoi, current: getStagePointer(stage) });
  };

  const handlePointerUp = () => {
    if (!draftRoi) {
      return;
    }
    const stageRect = normalizeRect(draftRoi.start, draftRoi.current);
    setDraftRoi(null);
    if (stageRect.width < MIN_ROI_SIDE_PX || stageRect.height < MIN_ROI_SIDE_PX) {
      return;
    }
    dispatch({ type: "linkedInsetCreated", sourceObjectId: draftRoi.sourceObjectId, stageRect });
  };

  return { draftRoi, handlePointerDown, handlePointerMove, handlePointerUp };
}

function createDraftRoi(figure: Figure, pointer: Point): DraftRoi | null {
  const sourceObject = findTopSourceImageAtPoint(figure, pointer);
  if (!sourceObject) {
    return null;
  }
  return { sourceObjectId: sourceObject.id, start: pointer, current: pointer };
}

function getMountedStage(stageRef: RefObject<Konva.Stage | null>): Konva.Stage {
  if (!stageRef.current) {
    throw new Error("Figure Stage is not mounted.");
  }
  return stageRef.current;
}

function isBackgroundClick(
  stage: Konva.Stage,
  event: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
): boolean {
  return event.target === stage || event.target.name() === "figure-background";
}

