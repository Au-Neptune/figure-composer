import type { Figure, ToolMode } from "../model/figure";
import type { Rect } from "../model/geometry";
import type { ImportedSourceImage } from "../model/sourceImage";
import {
  addSourceImageToFigure,
  createInitialFigure,
  createLinkedInsetFromStageRect,
  moveFigureObject,
  resizeFigureObject,
  selectFigureObject,
  selectRoiFrame,
  setTool,
  updateRoiFromStageRect,
} from "./figureCommands";

export type ProjectAction =
  | { readonly type: "projectOpened"; readonly figure: Figure }
  | { readonly type: "sourceImageImported"; readonly imported: ImportedSourceImage }
  | {
      readonly type: "linkedInsetCreated";
      readonly sourceObjectId: string;
      readonly stageRect: Rect;
    }
  | {
      readonly type: "figureObjectMoved";
      readonly objectId: string;
      readonly x: number;
      readonly y: number;
    }
  | {
      readonly type: "figureObjectResized";
      readonly objectId: string;
      readonly bounds: Rect;
    }
  | { readonly type: "roiChanged"; readonly roiId: string; readonly stageRect: Rect }
  | { readonly type: "figureObjectSelected"; readonly objectId: string | null }
  | { readonly type: "roiFrameSelected"; readonly roiId: string }
  | { readonly type: "toolChanged"; readonly tool: ToolMode };

export function createInitialProject(): Figure {
  return createInitialFigure();
}

export function projectReducer(figure: Figure, action: ProjectAction): Figure {
  switch (action.type) {
    case "projectOpened":
      return action.figure;
    case "sourceImageImported":
      return addSourceImageToFigure(figure, action.imported);
    case "linkedInsetCreated":
      return createLinkedInsetFromStageRect(
        figure,
        action.sourceObjectId,
        action.stageRect,
      );
    case "figureObjectMoved":
      return moveFigureObject(figure, action.objectId, {
        x: action.x,
        y: action.y,
      });
    case "figureObjectResized":
      return resizeFigureObject(figure, action.objectId, action.bounds);
    case "roiChanged":
      return updateRoiFromStageRect(figure, action.roiId, action.stageRect);
    case "figureObjectSelected":
      return selectFigureObject(figure, action.objectId);
    case "roiFrameSelected":
      return selectRoiFrame(figure, action.roiId);
    case "toolChanged":
      return setTool(figure, action.tool);
  }
}
