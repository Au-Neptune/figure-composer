import type { Dispatch, ReactElement } from "react";
import type Konva from "konva";
import { Group, Line, Rect } from "react-konva";
import type { Size, Point } from "../model/geometry";
import { MIN_EXPORT_DIMENSION } from "../state/editorDefaults";
import type { ProjectAction } from "../state/projectStore";
import { EDITOR_CHROME_NODE_NAME } from "./editorChrome";

const HANDLE_SIZE = 22;
const HANDLE_FILL = "#ffffff";
const HANDLE_STROKE = "#28766f";
const GRIP_STROKE = "#174d48";
const GRIP_STROKE_WIDTH = 2;
const GRIP_OFFSET_SMALL = 8;
const GRIP_OFFSET_LARGE = 14;

interface CanvasResizeHandleProps {
  readonly canvas: Size;
  readonly dispatch: Dispatch<ProjectAction>;
  readonly onResizePreview: (size: Size | null) => void;
}

export function CanvasResizeHandle({
  canvas,
  dispatch,
  onResizePreview,
}: CanvasResizeHandleProps): ReactElement {
  const position = getHandlePosition(canvas);
  const handleDragMove = (event: Konva.KonvaEventObject<DragEvent>) =>
    onResizePreview(readCanvasSize(event.target.position()));
  const handleDragEnd = (event: Konva.KonvaEventObject<DragEvent>) => {
    const size = readCanvasSize(event.target.position());
    onResizePreview(null);
    dispatch({ type: "canvasSettingsChanged", patch: size });
  };
  return (
    <Group
      name={EDITOR_CHROME_NODE_NAME}
      x={position.x}
      y={position.y}
      draggable
      dragBoundFunc={constrainHandlePosition}
      onMouseDown={stopCanvasPointerEvent}
      onTouchStart={stopCanvasPointerEvent}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <Rect
        width={HANDLE_SIZE}
        height={HANDLE_SIZE}
        fill={HANDLE_FILL}
        stroke={HANDLE_STROKE}
        strokeWidth={GRIP_STROKE_WIDTH}
        cornerRadius={4}
        shadowColor="rgba(31, 38, 31, 0.2)"
        shadowBlur={4}
      />
      <GripLine offset={GRIP_OFFSET_SMALL} />
      <GripLine offset={GRIP_OFFSET_LARGE} />
    </Group>
  );
}

function GripLine({ offset }: { readonly offset: number }): ReactElement {
  return (
    <Line
      points={[offset, HANDLE_SIZE, HANDLE_SIZE, offset]}
      stroke={GRIP_STROKE}
      strokeWidth={GRIP_STROKE_WIDTH}
      listening={false}
    />
  );
}

function getHandlePosition(canvas: Size): Point {
  return {
    x: canvas.width - HANDLE_SIZE,
    y: canvas.height - HANDLE_SIZE,
  };
}

function constrainHandlePosition(position: Point): Point {
  return {
    x: Math.max(MIN_EXPORT_DIMENSION - HANDLE_SIZE, position.x),
    y: Math.max(MIN_EXPORT_DIMENSION - HANDLE_SIZE, position.y),
  };
}

function readCanvasSize(position: Point): Size {
  return {
    width: Math.max(MIN_EXPORT_DIMENSION, Math.round(position.x + HANDLE_SIZE)),
    height: Math.max(MIN_EXPORT_DIMENSION, Math.round(position.y + HANDLE_SIZE)),
  };
}

function stopCanvasPointerEvent(
  event: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
): void {
  event.cancelBubble = true;
}
