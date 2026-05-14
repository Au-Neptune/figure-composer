import type { ExportPresetPatch } from "../model/exportPreset";
import type {
  CanvasSettingsPatch,
  Figure,
  InsetDockSide,
  ToolMode,
} from "../model/figure";
import type { Rect } from "../model/geometry";
import type { ImportedSourceImage } from "../model/sourceImage";
import {
  createLinkedInsetFromStageRect,
  dockInsetObject,
  moveFigureObject,
  resizeFigureObject,
  selectFigureObject,
  selectRoiFrame,
  setTool,
  updateCanvasSettings,
  updateRoiFromStageRect,
} from "./figureCommands";
import {
  addSourceImageToFigure,
  createInitialFigure,
} from "./figureFactory";
import { updateExportPreset } from "./exportPresetCommands";
import { deleteSourceImage, renameSourceImage } from "./sourceImageCommands";

export type ProjectAction =
  | { readonly type: "projectOpened"; readonly figure: Figure }
  | { readonly type: "sourceImageImported"; readonly imported: ImportedSourceImage }
  | {
      readonly type: "sourceImageRenamed";
      readonly sourceImageId: string;
      readonly name: string;
    }
  | { readonly type: "sourceImageDeleted"; readonly sourceImageId: string }
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
  | { readonly type: "canvasSettingsChanged"; readonly patch: CanvasSettingsPatch }
  | { readonly type: "insetDocked"; readonly objectId: string; readonly side: InsetDockSide }
  | { readonly type: "figureObjectSelected"; readonly objectId: string | null }
  | { readonly type: "roiFrameSelected"; readonly roiId: string }
  | { readonly type: "toolChanged"; readonly tool: ToolMode }
  | {
      readonly type: "exportPresetChanged";
      readonly presetId: string;
      readonly patch: ExportPresetPatch;
    };

export function createInitialProject(): Figure {
  return createInitialFigure();
}

export function projectReducer(figure: Figure, action: ProjectAction): Figure {
  switch (action.type) {
    case "projectOpened":
      return action.figure;
    case "sourceImageImported":
      return addSourceImageToFigure(figure, action.imported);
    case "sourceImageRenamed":
      return renameSourceImage(figure, {
        sourceImageId: action.sourceImageId,
        name: action.name,
      });
    case "sourceImageDeleted":
      return deleteSourceImage(figure, action.sourceImageId);
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
    case "canvasSettingsChanged":
      return updateCanvasSettings(figure, action.patch);
    case "insetDocked":
      return dockInsetObject(figure, action.objectId, action.side);
    case "figureObjectSelected":
      return selectFigureObject(figure, action.objectId);
    case "roiFrameSelected":
      return selectRoiFrame(figure, action.roiId);
    case "toolChanged":
      return setTool(figure, action.tool);
    case "exportPresetChanged":
      return updateExportPreset(figure, {
        presetId: action.presetId,
        patch: action.patch,
      });
  }
}
