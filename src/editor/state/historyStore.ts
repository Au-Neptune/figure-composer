import type { Figure } from "../model/figure";
import {
  createInitialProject,
  projectReducer,
  type ProjectAction,
} from "./projectStore";

export interface HistoryState {
  readonly past: readonly Figure[];
  readonly present: Figure;
  readonly future: readonly Figure[];
}

export type HistoryAction =
  | ProjectAction
  | { readonly type: "undoRequested" }
  | { readonly type: "redoRequested" };

export function createInitialHistory(): HistoryState {
  return {
    past: [],
    present: createInitialProject(),
    future: [],
  };
}

export function historyReducer(
  state: HistoryState,
  action: HistoryAction,
): HistoryState {
  if (action.type === "undoRequested") {
    return undo(state);
  }
  if (action.type === "redoRequested") {
    return redo(state);
  }
  if (action.type === "projectOpened") {
    return createHistoryFromPresent(action.figure);
  }
  const nextFigure = projectReducer(state.present, action);
  if (!isUndoableProjectAction(action)) {
    return { ...state, present: nextFigure };
  }
  return {
    past: [...state.past, state.present],
    present: nextFigure,
    future: [],
  };
}

export function canUndo(state: HistoryState): boolean {
  return state.past.length > 0;
}

export function canRedo(state: HistoryState): boolean {
  return state.future.length > 0;
}

function undo(state: HistoryState): HistoryState {
  if (!canUndo(state)) {
    return state;
  }
  const previous = state.past[state.past.length - 1];
  if (!previous) {
    throw new Error("Undo history is corrupt: missing previous Figure.");
  }
  return {
    past: state.past.slice(0, -1),
    present: previous,
    future: [state.present, ...state.future],
  };
}

function redo(state: HistoryState): HistoryState {
  if (!canRedo(state)) {
    return state;
  }
  const next = state.future[0];
  if (!next) {
    throw new Error("Redo history is corrupt: missing next Figure.");
  }
  return {
    past: [...state.past, state.present],
    present: next,
    future: state.future.slice(1),
  };
}

function createHistoryFromPresent(present: Figure): HistoryState {
  return {
    past: [],
    present,
    future: [],
  };
}

function isUndoableProjectAction(action: ProjectAction): boolean {
  switch (action.type) {
    case "sourceImageImported":
    case "derivedSourceImageCreated":
    case "sourceImageRenamed":
    case "sourceImageDeleted":
    case "linkedInsetCreated":
    case "figureObjectMoved":
    case "figureObjectResized":
    case "roiChanged":
    case "roiDeleted":
    case "canvasSettingsChanged":
    case "insetDocked":
    case "exportPresetChanged":
      return true;
    case "projectOpened":
    case "figureObjectSelected":
    case "roiFrameSelected":
    case "toolChanged":
      return false;
  }
}
