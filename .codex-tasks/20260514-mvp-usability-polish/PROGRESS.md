# Progress Log

---

## Session Start

- **Date**: 2026-05-14
- **Task name**: `20260514-mvp-usability-polish`
- **Task dir**: `.codex-tasks/20260514-mvp-usability-polish/`
- **Spec**: See SPEC.md
- **Plan**: See TODO.csv (5 milestones)
- **Environment**: TypeScript / React / Vitest

---

## Context Recovery Block

- **Current milestone**: complete
- **Current status**: DONE
- **Last completed**: #4 - Polish export controls
- **Current artifact**: `.codex-tasks/20260514-mvp-usability-polish/TODO.csv`
- **Key context**: All requested MVP usability changes are implemented and validated; ROI controls also appear when the selected object is the linked inset created by ROI drag.
- **Known issues**: None yet.
- **Next action**: none.

---

## Milestone 1: Add ROI deletion state and UI

- **Status**: DONE
- **Started**: 19:05
- **Completed**: 19:07
- **What was done**:
  - Added `roiDeleted` reducer/history action.
  - Added ROI deletion command that removes linked inset objects and source references.
  - Added Inspector controls for crop and delete on the selected ROI.
  - Added focused ROI deletion tests.
- **Key decisions**:
  - Decision: Block ROI deletion when a derived source image still references that ROI.
  - Reasoning: Project reference validation requires derived lineage to point to an existing ROI.
- **Problems encountered**:
  - None.
- **Validation**: `npm.cmd run test -- --run src/editor/state/projectStore.test.ts src/editor/state/roiCommands.test.ts` exit 0
- **Files changed**:
  - `src/editor/state/roiCommands.ts` - ROI delete command.
  - `src/editor/state/projectStore.ts` - action routing.
  - `src/editor/state/historyStore.ts` - undo tracking.
  - `src/app/Inspector.tsx` - selected ROI delete button.
  - `src/app/useFigureComposerController.ts` - visible-error handler.
  - `src/editor/state/roiCommands.test.ts` - reducer coverage.
- **Next step**: Milestone 2 - Add canvas drag resize

---

## Milestone 2: Add canvas drag resize

- **Status**: DONE
- **Started**: 19:08
- **Completed**: 19:10
- **What was done**:
  - Added a Konva resize handle at the canvas bottom-right corner.
  - Added local draft canvas sizing during drag.
  - Committed canvas size through the existing `canvasSettingsChanged` action on drag end.
- **Key decisions**:
  - Decision: Preview drag dimensions locally and write one reducer action on release.
  - Reasoning: This keeps undo history usable while still making resize interactive.
- **Problems encountered**:
  - None.
- **Validation**: `npm.cmd run typecheck` exit 0
- **Files changed**:
  - `src/editor/canvas/CanvasResizeHandle.tsx` - canvas handle.
  - `src/editor/canvas/FigureStage.tsx` - draft canvas preview and handle mounting.
- **Next step**: Milestone 3 - Add selected image right panel

---

## Milestone 3: Add selected image right panel

- **Status**: DONE
- **Started**: 19:11
- **Completed**: 19:14
- **What was done**:
  - Added a right-side `SelectionPanel`.
  - Displayed selected image name, type, and intrinsic source pixel dimensions.
  - Added direct numeric editing for selected object x/y/width/height.
  - Wired edits to existing move/resize reducer actions.
- **Key decisions**:
  - Decision: Reuse object move/resize actions instead of adding a separate bounds action.
  - Reasoning: Existing reducer paths already enforce canvas constraints and undo behavior.
- **Problems encountered**:
  - None.
- **Validation**: `npm.cmd run typecheck` exit 0
- **Files changed**:
  - `src/app/SelectionPanel.tsx` - selected image panel.
  - `src/app/SelectionPanel.css` - right panel styling.
  - `src/app/App.tsx` - panel mount.
  - `src/app/App.css` - three-column workspace.
  - `src/app/useFigureComposerController.ts` - bounds edit dispatch.
- **Next step**: Milestone 4 - Polish export controls

---

## Milestone 4: Polish export controls

- **Status**: DONE
- **Started**: 19:14
- **Completed**: 19:15
- **What was done**:
  - Changed toolbar export label from the current format to `Export`.
  - Kept format selection inside the export dialog.
  - Showed JPG quality as a visible percentage beside the slider.
  - Hid JPG quality control unless JPG is selected.
- **Key decisions**:
  - Decision: Keep the dialog confirm button format-aware while making the toolbar generic.
  - Reasoning: The toolbar opens export settings; the final action still benefits from confirming the selected format.
- **Problems encountered**:
  - None.
- **Validation**: `npm.cmd run typecheck` exit 0
- **Files changed**:
  - `src/app/AppToolbar.tsx` - generic export button.
  - `src/app/ExportPresetEditor.tsx` - JPG quality percent.
  - `src/app/App.css` - range value layout.
- **Next step**: Milestone 5 - Run final validation

---

## Milestone 5: Run final validation

- **Status**: DONE
- **Started**: 19:15
- **Completed**: 19:16
- **What was done**:
  - Ran full unit tests.
  - Ran TypeScript build checks.
  - Ran production Vite build.
  - Ran whitespace, source file length, and production function length checks.
  - Confirmed existing dev server responds on `http://127.0.0.1:5173/`.
  - Confirmed ROI controls are available from the linked inset selection state.
- **Key decisions**:
  - Decision: Treat existing large `.test.ts` describe blocks as pre-existing debt and keep production functions within the 50-line limit.
  - Reasoning: This task introduced no new test function-length offenders; all production code passes the check.
- **Problems encountered**:
  - Problem: Initial production component/controller functions exceeded the 50-line check.
  - Resolution: Split App workspace, FigureStage layer sections, and shortened controller handler construction.
  - Retry count: 0
- **Validation**:
  - `npm.cmd run test` exit 0, 8 files / 34 tests passed.
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

- **Total milestones**: 5
- **Completed**: 5
- **Failed + recovered**: 0
- **External unblock events**: 0
- **Total retries**: 0
- **Files created**: 7
- **Files modified**: 12
- **Key learnings**:
  - The existing reducer actions covered selection bounds editing; only ROI deletion needed a new command.
  - Canvas drag resize works cleanly when preview state stays local and commits once on drag end.
