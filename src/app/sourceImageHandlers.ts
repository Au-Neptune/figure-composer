import type { Dispatch } from "react";
import type { Figure } from "../editor/model/figure";
import type { Size } from "../editor/model/geometry";
import { getRoi, getSourceImage } from "../editor/model/selectors";
import {
  createCroppedSourceImageAsset,
  createResizedSourceImageAsset,
  createRotatedSourceImageAsset,
} from "../editor/image/deriveSourceImageAsset";
import type { HistoryAction } from "../editor/state/historyStore";
import {
  validateSourceImageDelete,
  validateSourceImageRename,
} from "../editor/state/sourceImageCommands";
import { runWithVisibleAsyncCommand, runWithVisibleCommand } from "./visibleErrors";

const DEFAULT_RESIZE_SCALE = 0.5;
const DEFAULT_ROTATION_DEGREES = 90;

interface SourceImageHandlerOptions {
  readonly figure: Figure;
  readonly dispatch: Dispatch<HistoryAction>;
  readonly setErrorMessage: (message: string | null) => void;
}

export function createRenameSourceImageHandler({
  figure,
  dispatch,
  setErrorMessage,
}: SourceImageHandlerOptions) {
  return (sourceImageId: string, name: string): boolean =>
    runWithVisibleCommand(() => {
      validateSourceImageRename(figure, { sourceImageId, name });
      dispatch({ type: "sourceImageRenamed", sourceImageId, name });
    }, setErrorMessage);
}

export function createDeleteSourceImageHandler({
  figure,
  dispatch,
  setErrorMessage,
}: SourceImageHandlerOptions) {
  return (sourceImageId: string): boolean =>
    runWithVisibleCommand(() => {
      validateSourceImageDelete(figure, sourceImageId);
      dispatch({ type: "sourceImageDeleted", sourceImageId });
    }, setErrorMessage);
}

export function createCropRoiToSourceImageHandler({
  figure,
  dispatch,
  setErrorMessage,
}: SourceImageHandlerOptions) {
  return (roiId: string): Promise<boolean> =>
    runWithVisibleAsyncCommand(async () => {
      const roi = getRoi(figure, roiId);
      const sourceImage = getSourceImage(figure, roi.sourceImageId);
      const imported = await createCroppedSourceImageAsset(sourceImage, roi.rect);
      dispatch({
        type: "derivedSourceImageCreated",
        derived: {
          ...imported,
          parentSourceImageId: sourceImage.id,
          operation: { kind: "crop", roiId: roi.id, cropRect: roi.rect },
        },
      });
    }, setErrorMessage);
}

export function createResizeSourceImageHandler({
  figure,
  dispatch,
  setErrorMessage,
}: SourceImageHandlerOptions) {
  return (sourceImageId: string): Promise<boolean> =>
    runWithVisibleAsyncCommand(async () => {
      const sourceImage = getSourceImage(figure, sourceImageId);
      const outputSize = createHalfSize(sourceImage);
      const imported = await createResizedSourceImageAsset(sourceImage, outputSize);
      dispatch({
        type: "derivedSourceImageCreated",
        derived: {
          ...imported,
          parentSourceImageId: sourceImage.id,
          operation: { kind: "resize", sourceSize: sourceImage, outputSize },
        },
      });
    }, setErrorMessage);
}

export function createRotateSourceImageHandler({
  figure,
  dispatch,
  setErrorMessage,
}: SourceImageHandlerOptions) {
  return (sourceImageId: string): Promise<boolean> =>
    runWithVisibleAsyncCommand(async () => {
      const sourceImage = getSourceImage(figure, sourceImageId);
      const imported = await createRotatedSourceImageAsset(
        sourceImage,
        DEFAULT_ROTATION_DEGREES,
      );
      dispatch({
        type: "derivedSourceImageCreated",
        derived: {
          ...imported,
          parentSourceImageId: sourceImage.id,
          operation: {
            kind: "rotate",
            degrees: DEFAULT_ROTATION_DEGREES,
            sourceSize: sourceImage,
          },
        },
      });
    }, setErrorMessage);
}

function createHalfSize(size: Size): Size {
  return {
    width: Math.max(1, Math.round(size.width * DEFAULT_RESIZE_SCALE)),
    height: Math.max(1, Math.round(size.height * DEFAULT_RESIZE_SCALE)),
  };
}
