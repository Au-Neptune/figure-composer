import type { Dispatch } from "react";
import type Konva from "konva";
import type { Box } from "konva/lib/shapes/Transformer";
import type { Figure, FigureObject } from "../model/figure";
import type { Point, Rect as ModelRect, Size } from "../model/geometry";
import type {
  PlacementGuide,
  PlacementSnapResult,
} from "../model/placementSnapping";
import {
  snapRectToPlacementTargets,
  snapResizeRectToPlacementTargets,
} from "../model/placementSnapping";
import {
  MIN_OBJECT_SIDE_PX,
  SNAP_GUIDE_THRESHOLD_PX,
} from "../state/editorDefaults";
import type { ProjectAction } from "../state/projectStore";

interface PlacementGuideWriter {
  readonly onPlacementGuidesChange: (guides: readonly PlacementGuide[]) => void;
}

interface DispatchMoveOptions extends PlacementGuideWriter {
  readonly objectId: string;
  readonly event: Konva.KonvaEventObject<DragEvent>;
  readonly dispatch: Dispatch<ProjectAction>;
}

export function dispatchMove({
  objectId,
  event,
  dispatch,
  onPlacementGuidesChange,
}: DispatchMoveOptions): void {
  onPlacementGuidesChange([]);
  dispatch({
    type: "figureObjectMoved",
    objectId,
    x: event.target.x(),
    y: event.target.y(),
  });
}

interface DispatchResizeOptions extends PlacementGuideWriter {
  readonly objectId: string;
  readonly node: TransformableNode | null;
  readonly dispatch: Dispatch<ProjectAction>;
}

export type TransformableNode = Konva.Image | Konva.Text;

export function dispatchResize({
  objectId,
  node,
  dispatch,
  onPlacementGuidesChange,
}: DispatchResizeOptions): void {
  if (!node) {
    throw new Error(`Rendered figure object node missing: ${objectId}`);
  }
  const bounds = readTransformedBounds(node);
  node.scaleX(1);
  node.scaleY(1);
  onPlacementGuidesChange([]);
  dispatch({ type: "figureObjectResized", objectId, bounds });
}

export function snapDragPosition({
  position,
  object,
  figure,
}: {
  readonly position: Point;
  readonly object: FigureObject;
  readonly figure: Figure;
}): Point {
  const result = snapObjectPosition({
    figure,
    objectId: object.id,
    rect: { x: position.x, y: position.y, width: object.width, height: object.height },
  });
  return { x: result.rect.x, y: result.rect.y };
}

export function updateDragGuides({
  figure,
  object,
  event,
  onPlacementGuidesChange,
}: {
  readonly figure: Figure;
  readonly object: FigureObject;
  readonly event: Konva.KonvaEventObject<DragEvent>;
  readonly onPlacementGuidesChange: (guides: readonly PlacementGuide[]) => void;
}): void {
  const result = snapObjectPosition({
    figure,
    objectId: object.id,
    rect: {
      x: event.target.x(),
      y: event.target.y(),
      width: object.width,
      height: object.height,
    },
  });
  onPlacementGuidesChange(result.guides);
}

export function updateTransformGuides({
  figure,
  object,
  node,
  onPlacementGuidesChange,
}: {
  readonly figure: Figure;
  readonly object: FigureObject;
  readonly node: TransformableNode | null;
  readonly onPlacementGuidesChange: (guides: readonly PlacementGuide[]) => void;
}): void {
  if (!node) {
    throw new Error(`Rendered figure object node missing: ${object.id}`);
  }
  const result = snapObjectResize({
    figure,
    object,
    rect: readTransformedBounds(node),
  });
  onPlacementGuidesChange(result.guides);
}

export function limitObjectBox({
  oldBox,
  newBox,
  figure,
  objectId,
}: {
  readonly oldBox: Box;
  readonly newBox: Box;
  readonly figure: Figure;
  readonly objectId: string;
}): Box {
  if (newBox.width < MIN_OBJECT_SIDE_PX || newBox.height < MIN_OBJECT_SIDE_PX) {
    return oldBox;
  }
  const snapped = snapResizeRectToPlacementTargets({
    oldRect: boxToRect(oldBox),
    rect: boxToRect(newBox),
    canvas: figure.canvas,
    objects: figure.objects,
    activeObjectId: objectId,
    threshold: SNAP_GUIDE_THRESHOLD_PX,
    minSize: MIN_OBJECT_SIDE_PX,
  });
  if (boxExceedsBounds(snapped.rect, figure.canvas)) {
    return oldBox;
  }
  return { ...newBox, ...snapped.rect };
}

function readTransformedBounds(node: TransformableNode): ModelRect {
  return {
    x: node.x(),
    y: node.y(),
    width: Math.max(MIN_OBJECT_SIDE_PX, node.width() * node.scaleX()),
    height: Math.max(MIN_OBJECT_SIDE_PX, node.height() * node.scaleY()),
  };
}

function snapObjectPosition({
  figure,
  objectId,
  rect,
}: {
  readonly figure: Figure;
  readonly objectId: string;
  readonly rect: ModelRect;
}): PlacementSnapResult {
  return snapRectToPlacementTargets({
    rect,
    canvas: figure.canvas,
    objects: figure.objects,
    activeObjectId: objectId,
    threshold: SNAP_GUIDE_THRESHOLD_PX,
  });
}

function snapObjectResize({
  figure,
  object,
  rect,
}: {
  readonly figure: Figure;
  readonly object: FigureObject;
  readonly rect: ModelRect;
}): PlacementSnapResult {
  return snapResizeRectToPlacementTargets({
    oldRect: object,
    rect,
    canvas: figure.canvas,
    objects: figure.objects,
    activeObjectId: object.id,
    threshold: SNAP_GUIDE_THRESHOLD_PX,
    minSize: MIN_OBJECT_SIDE_PX,
  });
}

function boxToRect(box: Box): ModelRect {
  return { x: box.x, y: box.y, width: box.width, height: box.height };
}

function boxExceedsBounds(box: ModelRect, bounds: Size): boolean {
  return (
    box.x < 0 ||
    box.y < 0 ||
    box.x + box.width > bounds.width ||
    box.y + box.height > bounds.height
  );
}
