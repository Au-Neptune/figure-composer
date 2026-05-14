import { describe, expect, it } from "vitest";
import type { ImportedSourceImage } from "../model/sourceImage";
import {
  canRedo,
  canUndo,
  createInitialHistory,
  historyReducer,
} from "./historyStore";

const IMPORTED_SOURCE_IMAGE: ImportedSourceImage = {
  name: "gel.jpg",
  assetUrl: "blob:test-gel",
  width: 640,
  height: 480,
};

describe("historyReducer", () => {
  it("tracks import as an undoable project edit", () => {
    const initialHistory = createInitialHistory();
    const importedHistory = historyReducer(initialHistory, {
      type: "sourceImageImported",
      imported: IMPORTED_SOURCE_IMAGE,
    });
    const undoneHistory = historyReducer(importedHistory, { type: "undoRequested" });
    const redoneHistory = historyReducer(undoneHistory, { type: "redoRequested" });

    expect(canUndo(importedHistory)).toBe(true);
    expect(canRedo(importedHistory)).toBe(false);
    expect(undoneHistory.present.sourceImages).toHaveLength(0);
    expect(canRedo(undoneHistory)).toBe(true);
    expect(redoneHistory.present.sourceImages).toHaveLength(1);
  });

  it("does not add selection changes to undo history", () => {
    const importedHistory = historyReducer(createInitialHistory(), {
      type: "sourceImageImported",
      imported: IMPORTED_SOURCE_IMAGE,
    });
    const selectedObjectId = importedHistory.present.selectedObjectId;
    const selectedHistory = historyReducer(importedHistory, {
      type: "figureObjectSelected",
      objectId: selectedObjectId,
    });

    expect(selectedHistory.past).toHaveLength(importedHistory.past.length);
    expect(selectedHistory.future).toHaveLength(0);
  });
});
