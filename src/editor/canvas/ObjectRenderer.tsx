import { useMemo } from "react";
import type { Dispatch, ReactElement } from "react";
import type Konva from "konva";
import type { Box } from "konva/lib/shapes/Transformer";
import { Image, Rect, Transformer } from "react-konva";
import { MIN_OBJECT_SIDE_PX } from "../state/editorDefaults";
import { useImageAsset } from "../image/loadImageAsset";
import type { Figure, FigureObject } from "../model/figure";
import type { Point, Rect as ModelRect, Size } from "../model/geometry";
import { constrainRectPosition } from "../model/geometry";
import { getRoi, getSourceImage } from "../model/selectors";
import type { ProjectAction } from "../state/projectStore";
import { useKonvaTransformer } from "./useKonvaTransformer";

interface ObjectRendererProps {
  readonly figure: Figure;
  readonly object: FigureObject;
  readonly dispatch: Dispatch<ProjectAction>;
}

export function ObjectRenderer({
  figure,
  object,
  dispatch,
}: ObjectRendererProps): ReactElement {
  const sourceImage = getSourceImage(figure, object.sourceImageId);
  const image = useImageAsset(sourceImage.assetUrl);
  const crop = useMemo(() => getCrop(figure, object), [figure, object]);
  if (!image) {
    return <LoadingFigureObject object={object} />;
  }
  return (
    <LoadedFigureObject
      figure={figure}
      object={object}
      image={image}
      crop={crop}
      dispatch={dispatch}
    />
  );
}

interface LoadedFigureObjectProps extends ObjectRendererProps {
  readonly image: HTMLImageElement;
  readonly crop: ModelRect | undefined;
}

function LoadedFigureObject({
  figure,
  object,
  image,
  crop,
  dispatch,
}: LoadedFigureObjectProps): ReactElement {
  const selected = figure.selectedObjectId === object.id;
  const { nodeRef, transformerRef } = useKonvaTransformer<Konva.Image>(selected);
  const handleDragEnd = (event: Konva.KonvaEventObject<DragEvent>) =>
    dispatchMove(object.id, event, dispatch);
  const handleTransformEnd = () =>
    dispatchResize(object.id, nodeRef.current, dispatch);
  const handleSelect = (
    event: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  ) =>
    selectFigureObject({
      figure,
      objectId: object.id,
      event,
      dispatch,
    });

  return (
    <>
      <Image
        ref={nodeRef}
        image={image}
        crop={crop}
        x={object.x}
        y={object.y}
        width={object.width}
        height={object.height}
        draggable={figure.tool === "select"}
        dragBoundFunc={(position) => constrainDragPosition(position, object, figure.canvas)}
        onMouseDown={handleSelect}
        onTouchStart={handleSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
      {selected ? (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) =>
            limitObjectBox(oldBox, newBox, figure.canvas)
          }
        />
      ) : null}
    </>
  );
}

function LoadingFigureObject({
  object,
}: {
  readonly object: FigureObject;
}): ReactElement {
  return (
    <Rect
      x={object.x}
      y={object.y}
      width={object.width}
      height={object.height}
      fill="#e7ece6"
      stroke="#8b9388"
    />
  );
}

function getCrop(figure: Figure, object: FigureObject): ModelRect | undefined {
  if (object.kind !== "inset") {
    return undefined;
  }
  return getRoi(figure, object.roiId).rect;
}

function readTransformedBounds(node: Konva.Image): ModelRect {
  return {
    x: node.x(),
    y: node.y(),
    width: Math.max(MIN_OBJECT_SIDE_PX, node.width() * node.scaleX()),
    height: Math.max(MIN_OBJECT_SIDE_PX, node.height() * node.scaleY()),
  };
}

function dispatchMove(
  objectId: string,
  event: Konva.KonvaEventObject<DragEvent>,
  dispatch: Dispatch<ProjectAction>,
): void {
  dispatch({
    type: "figureObjectMoved",
    objectId,
    x: event.target.x(),
    y: event.target.y(),
  });
}

function dispatchResize(
  objectId: string,
  node: Konva.Image | null,
  dispatch: Dispatch<ProjectAction>,
): void {
  if (!node) {
    throw new Error(`Rendered figure object node missing: ${objectId}`);
  }
  const bounds = readTransformedBounds(node);
  node.scaleX(1);
  node.scaleY(1);
  dispatch({ type: "figureObjectResized", objectId, bounds });
}

function constrainDragPosition(
  position: Point,
  object: FigureObject,
  bounds: Size,
): Point {
  const rect = constrainRectPosition({ ...object, ...position }, bounds);
  return { x: rect.x, y: rect.y };
}

interface SelectFigureObjectOptions {
  readonly figure: Figure;
  readonly objectId: string;
  readonly event: Konva.KonvaEventObject<MouseEvent | TouchEvent>;
  readonly dispatch: Dispatch<ProjectAction>;
}

function selectFigureObject({
  figure,
  objectId,
  event,
  dispatch,
}: SelectFigureObjectOptions): void {
  if (figure.tool !== "select") {
    return;
  }
  event.cancelBubble = true;
  dispatch({ type: "figureObjectSelected", objectId });
}

function limitObjectBox(
  oldBox: Box,
  newBox: Box,
  bounds: Size,
): Box {
  if (newBox.width < MIN_OBJECT_SIDE_PX || newBox.height < MIN_OBJECT_SIDE_PX) {
    return oldBox;
  }
  if (boxExceedsBounds(newBox, bounds)) {
    return oldBox;
  }
  return newBox;
}

function boxExceedsBounds(box: Box, bounds: Size): boolean {
  return (
    box.x < 0 ||
    box.y < 0 ||
    box.x + box.width > bounds.width ||
    box.y + box.height > bounds.height
  );
}
