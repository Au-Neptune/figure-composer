import type { Dispatch } from "react";
import type { Figure } from "../editor/model/figure";
import { getRoi, getSourceImage } from "../editor/model/selectors";
import type { HistoryAction } from "../editor/state/historyStore";
import {
  validateSourceImageDelete,
  validateSourceImageRename,
} from "../editor/state/sourceImageCommands";
import { createDerivedSourceCrop } from "../platform/browser/derivedSourceCrop";
import { runWithVisibleAsyncCommand, runWithVisibleCommand } from "./visibleErrors";

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

export function createDerivedCropHandler({
  figure,
  dispatch,
  setErrorMessage,
}: SourceImageHandlerOptions) {
  return (roiId: string): Promise<boolean> =>
    runWithVisibleAsyncCommand(async () => {
      const roi = getRoi(figure, roiId);
      const sourceImage = getSourceImage(figure, roi.sourceImageId);
      const derived = await createDerivedSourceCrop({ sourceImage, roi });
      dispatch({ type: "derivedSourceImageCreated", derived });
    }, setErrorMessage);
}
