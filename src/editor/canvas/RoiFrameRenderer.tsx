import type { Dispatch, ReactElement } from "react";
import type Konva from "konva";
import type { Box } from "konva/lib/shapes/Transformer";
import { Rect, Transformer } from "react-konva";
import { MIN_ROI_SIDE_PX } from "../state/editorDefaults";
import type { Figure, SourceImageObject } from "../model/figure";
import type { Point, Rect as ModelRect } from "../model/geometry";
import { constrainRectWithinRect } from "../model/geometry";
import {
  getSourceImage,
  getSourceImageObject,
  mapSourceRectToStageRect,
} from "../model/selectors";
import type { RegionOfInterest } from "../model/roi";
import type { ProjectAction } from "../state/projectStore";
import { useKonvaTransformer } from "./useKonvaTransformer";

interface RoiFrameRendererProps {
  readonly figure: Figure;
  readonly roi: RegionOfInterest;
  readonly dispatch: Dispatch<ProjectAction>;
}

export function RoiFrameRenderer({
  figure,
  roi,
  dispatch,
}: RoiFrameRendererProps): ReactElement | null {
  const sourceObject = getSourceImageObject(figure, roi.sourceObjectId);
  const sourceImage = getSourceImage(figure, roi.sourceImageId);
  const stageRect = mapSourceRectToStageRect(roi.rect, sourceObject, sourceImage);
  if (!roi.frame.visible) {
    return null;
  }
  return (
    <VisibleRoiFrame
      figure={figure}
      roi={roi}
      sourceObject={sourceObject}
      stageRect={stageRect}
      dispatch={dispatch}
    />
  );
}

interface VisibleRoiFrameProps extends RoiFrameRendererProps {
  readonly sourceObject: SourceImageObject;
  readonly stageRect: ModelRect;
}

function VisibleRoiFrame({
  figure,
  roi,
  sourceObject,
  stageRect,
  dispatch,
}: VisibleRoiFrameProps): ReactElement {
  const selected = figure.selectedRoiId === roi.id;
  const { nodeRef, transformerRef } = useKonvaTransformer<Konva.Rect>(selected);
  const handleDragEnd = (event: Konva.KonvaEventObject<DragEvent>) =>
    dispatchRoiMove({ roiId: roi.id, stageRect, event, dispatch });
  const handleTransformEnd = () =>
    dispatchRoiResize(roi.id, nodeRef.current, dispatch);
  const handleSelect = (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  ) => selectRoiFrame({ figure, roiId: roi.id, event, dispatch });

  return (
    <>
      <Rect
        ref={nodeRef}
        x={stageRect.x}
        y={stageRect.y}
        width={stageRect.width}
        height={stageRect.height}
        fill="rgba(225, 29, 72, 0.08)"
        stroke={roi.frame.stroke}
        strokeWidth={roi.frame.strokeWidth}
        draggable={figure.tool === "select"}
        dragBoundFunc={(position) =>
          constrainRoiDragPosition(position, stageRect, sourceObject)
        }
        onMouseDown={handleSelect}
        onTouchStart={handleSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
      {selected ? (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) =>
            limitRoiBox(oldBox, newBox, sourceObject)
          }
        />
      ) : null}
    </>
  );
}

function readTransformedBounds(node: Konva.Rect): ModelRect {
  return {
    x: node.x(),
    y: node.y(),
    width: Math.max(MIN_ROI_SIDE_PX, node.width() * node.scaleX()),
    height: Math.max(MIN_ROI_SIDE_PX, node.height() * node.scaleY()),
  };
}

interface DispatchRoiMoveOptions {
  readonly roiId: string;
  readonly stageRect: ModelRect;
  readonly event: Konva.KonvaEventObject<DragEvent>;
  readonly dispatch: Dispatch<ProjectAction>;
}

function dispatchRoiMove({
  roiId,
  stageRect,
  event,
  dispatch,
}: DispatchRoiMoveOptions): void {
  dispatch({
    type: "roiChanged",
    roiId,
    stageRect: { ...stageRect, x: event.target.x(), y: event.target.y() },
  });
}

function dispatchRoiResize(
  roiId: string,
  node: Konva.Rect | null,
  dispatch: Dispatch<ProjectAction>,
): void {
  if (!node) {
    throw new Error(`ROI frame node missing: ${roiId}`);
  }
  const nextRect = readTransformedBounds(node);
  node.scaleX(1);
  node.scaleY(1);
  dispatch({ type: "roiChanged", roiId, stageRect: nextRect });
}

function constrainRoiDragPosition(
  position: Point,
  stageRect: ModelRect,
  sourceObject: SourceImageObject,
): Point {
  const rect = constrainRectWithinRect({ ...stageRect, ...position }, sourceObject);
  return { x: rect.x, y: rect.y };
}

interface SelectRoiFrameOptions {
  readonly figure: Figure;
  readonly roiId: string;
  readonly event: Konva.KonvaEventObject<MouseEvent | TouchEvent>;
  readonly dispatch: Dispatch<ProjectAction>;
}

function selectRoiFrame({
  figure,
  roiId,
  event,
  dispatch,
}: SelectRoiFrameOptions): void {
  if (figure.tool !== "select") {
    return;
  }
  event.cancelBubble = true;
  dispatch({ type: "roiFrameSelected", roiId });
}

function limitRoiBox(
  oldBox: Box,
  newBox: Box,
  sourceObject: SourceImageObject,
): Box {
  if (newBox.width < MIN_ROI_SIDE_PX || newBox.height < MIN_ROI_SIDE_PX) {
    return oldBox;
  }
  if (roiBoxExceedsSourceObject(newBox, sourceObject)) {
    return oldBox;
  }
  return newBox;
}

function roiBoxExceedsSourceObject(
  box: Box,
  sourceObject: SourceImageObject,
): boolean {
  return (
    box.x < sourceObject.x ||
    box.y < sourceObject.y ||
    box.x + box.width > sourceObject.x + sourceObject.width ||
    box.y + box.height > sourceObject.y + sourceObject.height
  );
}
