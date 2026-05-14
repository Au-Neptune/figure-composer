# Progress Log

---

## Session Start

- **Date**: 2026-05-14
- **Task name**: `20260514-roi-on-insets-and-integer-fields`
- **Task dir**: `.codex-tasks/20260514-roi-on-insets-and-integer-fields/`
- **Spec**: See SPEC.md
- **Plan**: See TODO.csv (4 milestones)
- **Environment**: TypeScript / React / Vitest

---

## Context Recovery Block

- **Current milestone**: complete
- **Current status**: DONE
- **Last completed**: #5 - Block deleting ROI with child ROIs
- **Current artifact**: `.codex-tasks/20260514-roi-on-insets-and-integer-fields/TODO.csv`
- **Key context**: Delete ROI is now explicitly disabled in the Inspector when dependent nodes exist, with visible blocker text.
- **Known issues**: Existing project JSON compatibility for derived Source Images should remain.
- **Next action**: none.

---

## Milestone 1: Remove derived crop UI and controller path

- **Status**: DONE
- **Started**: 19:55
- **Completed**: 20:02
- **What was done**:
  - Removed `Crop Source` from Inspector ROI controls.
  - Removed derived crop handler wiring from Workspace/controller.
  - Removed the reducer/history action for creating derived Source Images.
  - Deleted the browser canvas crop helper.
  - Kept project JSON derived lineage parsing for old project compatibility.
- **Key decisions**:
  - Decision: Remove the user-triggerable feature path while preserving JSON compatibility.
  - Reasoning: Existing saved files may contain derived Source Image lineage even though new creation is no longer exposed.
- **Problems encountered**:
  - Problem: Existing tests still used the removed action.
  - Resolution: Removed the reducer feature test and changed ROI delete compatibility coverage to manual old-project lineage data.
- **Validation**: `npm.cmd run typecheck` exit 0
- **Files changed**:
  - `src/app/Inspector.tsx`
  - `src/app/Workspace.tsx`
  - `src/app/useFigureComposerController.ts`
  - `src/app/sourceImageHandlers.ts`
  - `src/editor/state/projectStore.ts`
  - `src/editor/state/historyStore.ts`
  - `src/editor/state/figureFactory.ts`
  - `src/editor/model/sourceImage.ts`
  - `src/platform/browser/derivedSourceCrop.ts`
  - `src/editor/state/projectStore.test.ts`
  - `src/editor/state/roiCommands.test.ts`
- **Next step**: Milestone 2 - Support ROI creation and rendering on insets

---

## Milestone 2: Support ROI creation and rendering on insets

- **Status**: DONE
- **Started**: 20:02
- **Completed**: 20:08
- **What was done**:
  - Changed ROI source selection from source-image-only to any top Figure object.
  - Added source/stage rect mapping for source image objects and inset objects.
  - Allowed project reference validation for ROI source objects that are insets.
  - Updated ROI frame and export preview rendering to use generic Figure objects.
  - Added nested inset ROI coverage.
- **Key decisions**:
  - Decision: For an inset, the visible source rect is the ROI rect that inset displays.
  - Reasoning: Nested ROIs should remain in original source-image coordinates while visually mapping to the inset.
- **Problems encountered**:
  - Problem: Initial mapping allowed negative source coordinates when a dragged stage rect exceeded the source object.
  - Resolution: Constrain stage rect to the source object before source-coordinate mapping.
- **Validation**: `npm.cmd run test -- --run src/editor/state/projectStore.test.ts src/editor/project/projectReferences.test.ts src/editor/state/roiCommands.test.ts` exit 0
- **Files changed**:
  - `src/editor/model/selectors.ts`
  - `src/editor/tools/useRoiDraftTool.ts`
  - `src/editor/state/figureCommands.ts`
  - `src/editor/state/insetDocking.ts`
  - `src/editor/canvas/RoiFrameRenderer.tsx`
  - `src/app/ExportPreview.tsx`
  - `src/editor/project/projectReferences.ts`
  - `src/editor/state/projectStore.test.ts`
  - `src/editor/project/projectReferences.test.ts`
- **Next step**: Milestone 3 - Restrict selection panel fields to integers

---

## Milestone 3: Restrict selection panel fields to integers

- **Status**: DONE
- **Started**: 20:08
- **Completed**: 20:10
- **What was done**:
  - Rounded Selection panel x/y/width/height display values.
  - Rounded Selection panel numeric patches before dispatch.
  - Added numeric input mode to the right-side bounds fields.
- **Key decisions**:
  - Decision: Keep reducer geometry unchanged and constrain the right-side field UI.
  - Reasoning: The user requested the right-side info fields specifically, while canvas drag/transform can still operate normally.
- **Problems encountered**:
  - None.
- **Validation**: `npm.cmd run typecheck` exit 0
- **Files changed**:
  - `src/app/SelectionPanel.tsx`
- **Next step**: Milestone 4 - Run final validation

---

## Milestone 4: Run final validation

- **Status**: DONE
- **Started**: 20:10
- **Completed**: 20:14
- **What was done**:
  - Ran full unit tests.
  - Ran TypeScript typecheck.
  - Ran production build.
  - Ran whitespace, source file size, and production function length checks.
  - Confirmed existing dev server responds on `http://127.0.0.1:5173/`.
- **Key decisions**:
  - Decision: Leave derived lineage parsing in project JSON.
  - Reasoning: The user asked to remove the crop feature, not break old saved projects that contain derived metadata.
- **Problems encountered**:
  - None after milestone 2 mapping fix.
- **Validation**:
  - `npm.cmd run test` exit 0, 9 files / 36 tests passed.
  - `npm.cmd run typecheck` exit 0.
  - `npm.cmd run build` exit 0 with the existing Vite chunk-size warning.
  - `git -c safe.directory="D:/code/Figure Composer" -c core.quotepath=false diff --check` exit 0.
  - Source file size check exit 0.
  - Production function length check exit 0.
  - `Invoke-WebRequest http://127.0.0.1:5173/` returned HTTP 200.
- **Files changed**:
  - See final summary.
- **Next step**: none.

---

## Final Summary

- **Total milestones**: 4
- **Completed**: 4
- **Failed + recovered**: 0
- **External unblock events**: 0
- **Total retries**: 0
- **Files created**: 3
- **Files modified**: 19
- **Files deleted**: 1
- **Key learnings**:
  - ROI source objects can be modeled as generic figure objects while source coordinates stay anchored to the original image.
  - UI-level integer bounds are sufficient for the right panel without forcing Konva transform math into integers.

---

## Milestone 5: Block deleting ROI with child ROIs

- **Status**: DONE
- **Started**: 20:04
- **Completed**: 20:05
- **What was done**:
  - Added a reducer regression test for deleting a parent ROI that has a child ROI on its linked inset.
  - Added a delete guard that detects child ROIs before removing linked insets.
  - Re-ran full validation after the focused regression passed.
- **Key decisions**:
  - Decision: Block deletion instead of cascading deletion.
  - Reasoning: Cascading deletion would silently remove user-created child ROI/inset work; an explicit error preserves graph integrity.
- **Problems encountered**:
  - Problem: The red test confirmed deletion returned a mutated invalid graph instead of throwing.
  - Resolution: Check linked inset ids against all ROI `sourceObjectId` values before deletion.
- **Validation**:
  - `npm.cmd run test -- --run src/editor/state/roiCommands.test.ts` exit 0.
  - `npm.cmd run test` exit 0, 9 files / 37 tests passed.
  - `npm.cmd run typecheck` exit 0.
  - `npm.cmd run build` exit 0 with the existing Vite chunk-size warning.
  - `git -c safe.directory="D:/code/Figure Composer" -c core.quotepath=false diff --check` exit 0.
  - Source file size check exit 0.
  - Production function length check exit 0.
- **Files changed**:
  - `src/editor/state/roiCommands.ts`
  - `src/editor/state/roiCommands.test.ts`
- **Next step**: none.

---

## Milestone 6: Disable ROI delete when dependent nodes exist

- **Status**: DONE
- **Started**: 20:06
- **Completed**: 20:08
- **What was done**:
  - Added a queryable ROI delete blocker object.
  - Reused that blocker in the reducer guard and Inspector UI.
  - Disabled Delete ROI when child ROIs or derived lineage depend on the ROI.
  - Displayed the blocking reason next to the disabled button.
- **Key decisions**:
  - Decision: Explicitly block in UI rather than cascade-delete child ROI nodes.
  - Reasoning: This avoids destructive surprises while making the blocked state visible before the user clicks.
- **Problems encountered**:
  - None.
- **Validation**:
  - `npm.cmd run test -- --run src/editor/state/roiCommands.test.ts` exit 0.
  - `npm.cmd run test` exit 0, 9 files / 37 tests passed.
  - `npm.cmd run typecheck` exit 0.
  - `npm.cmd run build` exit 0 with the existing Vite chunk-size warning.
  - `git -c safe.directory="D:/code/Figure Composer" -c core.quotepath=false diff --check` exit 0.
  - Source file size check exit 0.
  - Production function length check exit 0.
- **Files changed**:
  - `src/editor/state/roiCommands.ts`
  - `src/editor/state/roiCommands.test.ts`
  - `src/app/Inspector.tsx`
  - `src/app/App.css`
- **Next step**: none.
