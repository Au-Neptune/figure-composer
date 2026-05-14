import { useMemo } from "react";
import type { Dispatch, ReactElement, RefObject } from "react";
import type Konva from "konva";
import { Image, Rect, Transformer } from "react-konva";
import { useImageAsset } from "../image/loadImageAsset";
import type { Figure, FigureObject } from "../model/figure";
import type { Rect as ModelRect } from "../model/geometry";
import type { PlacementGuide } from "../model/placementSnapping";
import { getRoi, getSourceImage } from "../model/selectors";
import type { ProjectAction } from "../state/projectStore";
import {
  dispatchMove,
  dispatchResize,
  limitObjectBox,
  snapDragPosition,
  updateDragGuides,
  updateTransformGuides,
} from "./objectPlacementInteractions";
import { useKonvaTransformer } from "./useKonvaTransformer";

interface ObjectRendererProps {
  readonly figure: Figure;
  readonly object: FigureObject;
  readonly dispatch: Dispatch<ProjectAction>;
  readonly onPlacementGuidesChange: (guides: readonly PlacementGuide[]) => void;
}

export function ObjectRenderer({
  figure,
  object,
  dispatch,
  onPlacementGuidesChange,
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
      onPlacementGuidesChange={onPlacementGuidesChange}
    />
  );
}

interface LoadedFigureObjectProps extends ObjectRendererProps {
  readonly image: HTMLImageElement;
  readonly crop: ModelRect | undefined;
}

interface ObjectInteractionHandlerOptions extends ObjectRendererProps {
  readonly nodeRef: RefObject<Konva.Image | null>;
}

function LoadedFigureObject({
  figure,
  object,
  image,
  crop,
  dispatch,
  onPlacementGuidesChange,
}: LoadedFigureObjectProps): ReactElement {
  const selected = figure.selectedObjectId === object.id;
  const { nodeRef, transformerRef } = useKonvaTransformer<Konva.Image>(selected);
  const handlers = createObjectInteractionHandlers({
    figure,
    object,
    dispatch,
    onPlacementGuidesChange,
    nodeRef,
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
        dragBoundFunc={(position) => snapDragPosition({ position, object, figure })}
        onMouseDown={handlers.handleSelect}
        onTouchStart={handlers.handleSelect}
        onDragMove={handlers.handleDragMove}
        onDragEnd={handlers.handleDragEnd}
        onTransform={handlers.handleTransform}
        onTransformEnd={handlers.handleTransformEnd}
      />
      {selected ? (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) =>
            limitObjectBox({ oldBox, newBox, figure, objectId: object.id })
          }
        />
      ) : null}
    </>
  );
}

function createObjectInteractionHandlers({
  figure,
  object,
  dispatch,
  onPlacementGuidesChange,
  nodeRef,
}: ObjectInteractionHandlerOptions) {
  return {
    handleDragMove: (event: Konva.KonvaEventObject<DragEvent>) =>
      updateDragGuides({ figure, object, event, onPlacementGuidesChange }),
    handleDragEnd: (event: Konva.KonvaEventObject<DragEvent>) =>
      dispatchMove({ objectId: object.id, event, dispatch, onPlacementGuidesChange }),
    handleTransform: () =>
      updateTransformGuides({
        figure,
        object,
        node: nodeRef.current,
        onPlacementGuidesChange,
      }),
    handleTransformEnd: () =>
      dispatchResize({
        objectId: object.id,
        node: nodeRef.current,
        dispatch,
        onPlacementGuidesChange,
      }),
    handleSelect: (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) =>
      selectFigureObject({
        figure,
        objectId: object.id,
        event,
        dispatch,
      }),
  };
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
