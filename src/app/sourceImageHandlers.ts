import type { Dispatch } from "react";
import type { Figure } from "../editor/model/figure";
import type { HistoryAction } from "../editor/state/historyStore";
import {
  validateSourceImageDelete,
  validateSourceImageRename,
} from "../editor/state/sourceImageCommands";
import { runWithVisibleCommand } from "./visibleErrors";

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
