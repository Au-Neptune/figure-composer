# Progress Log

---

## Session Start

- **Date**: 2026-05-14 18:33 +08:00
- **Task name**: `20260514-derived-crop`
- **Task dir**: `.codex-tasks/20260514-mvp-hardening-epic/tasks/20260514-derived-crop/`
- **Spec**: See `SPEC.md`
- **Plan**: See `TODO.csv` (5 milestones)
- **Environment**: React / TypeScript / Vite / Konva / Vitest

---

## Context Recovery Block

- **Current milestone**: #5 Validate and close child task
- **Current status**: DONE
- **Last completed**: #4 Wire crop action into UI
- **Current artifact**: `TODO.csv`
- **Key context**: Epic child #4 is active. Source image management and export
  preview workflows are complete and pushed through commit `b81fe64`.
- **Known issues**: Vite build reports a chunk size warning.
- **Next action**: Return to parent epic and begin child #5.

---

## Milestone 1: Inspect ROI source and project flow

- **Status**: DONE
- **Started**: 18:33
- **Completed**: 18:36
- **What was done**:
  - Created child task state.
  - Inspected Source Image, ROI, selectors, project JSON, project JSON
    validation, file asset handling, Source Image List UI, ObjectRenderer crop
    behavior, and selected ROI action surfaces.
- **Key decisions**:
  - Decision: Store lineage on Source Image as imported or derived metadata.
  - Reasoning: Lineage belongs to the Source Image asset, not to an Inset or
    transient crop action.
  - Decision: Use selected ROI as the crop action surface.
  - Reasoning: ROI selection already exists and points to a precise source rect.
- **Problems encountered**:
  - Problem: None.
  - Resolution: Not applicable.
  - Retry count: 0
- **Validation**: `git -c safe.directory="D:/code/Figure Composer" -c core.quotepath=false status --short` -> exit 0 with only child task artifacts modified.
- **Next step**: Milestone 2 Add source image lineage and JSON support.

---

## Milestone 2: Add source image lineage and JSON support

- **Status**: DONE
- **Started**: 18:36
- **Completed**: 18:37
- **What was done**:
  - Added Source Image lineage as `imported` or `derived`.
  - Serialized and hydrated lineage in project JSON.
  - Parsed legacy Source Images without lineage as imported sources.
  - Added tests for imported lineage, legacy compatibility, and derived lineage.
- **Key decisions**:
  - Decision: Default missing lineage to imported during project JSON parsing.
  - Reasoning: Existing project JSON files should continue to open without a
    migration step.
- **Problems encountered**:
  - Problem: None.
  - Resolution: Not applicable.
  - Retry count: 0
- **Validation**: `npm.cmd run test` -> exit 0, 5 files / 26 tests passed.
- **Files changed**:
  - `src/editor/model/sourceImage.ts`
  - `src/editor/state/figureFactory.ts`
  - `src/editor/project/projectJson.ts`
  - `src/editor/project/projectJsonValidation.ts`
  - `src/editor/project/projectJson.test.ts`
- **Next step**: Milestone 3 Add crop creation workflow.

---

## Milestone 3: Add crop creation workflow

- **Status**: DONE
- **Started**: 18:37
- **Completed**: 18:40
- **What was done**:
  - Added `DerivedSourceImageInput`.
  - Added reducer workflow for adding a Derived Source Image to the Figure.
  - Made derived source creation undoable.
  - Added browser crop helper that creates a PNG object URL from a ROI.
  - Added reducer test proving the parent Source Image is not mutated.
- **Key decisions**:
  - Decision: The browser crop helper creates the asset, while the reducer only
    receives derived source input.
  - Reasoning: DOM/canvas work belongs at the platform boundary; reducer logic
    remains deterministic and testable.
- **Problems encountered**:
  - Problem: None.
  - Resolution: Not applicable.
  - Retry count: 0
- **Validation**: `npm.cmd run test` -> exit 0, 5 files / 27 tests passed.
- **Files changed**:
  - `src/editor/model/sourceImage.ts`
  - `src/editor/state/figureFactory.ts`
  - `src/editor/state/projectStore.ts`
  - `src/editor/state/historyStore.ts`
  - `src/platform/browser/derivedSourceCrop.ts`
  - `src/editor/state/projectStore.test.ts`
- **Next step**: Milestone 4 Wire crop action into UI.

---

## Milestone 4: Wire crop action into UI

- **Status**: DONE
- **Started**: 18:40
- **Completed**: 18:41
- **What was done**:
  - Added controller handler for creating a Derived Source Image from selected
    ROI data.
  - Added Inspector ROI action UI with a crop icon.
  - Routed browser crop failures through the existing visible error message.
- **Key decisions**:
  - Decision: The crop action is shown only when a ROI is selected.
  - Reasoning: The action needs a precise ROI id and should not guess from
    unrelated selected objects.
- **Problems encountered**:
  - Problem: First `npm.cmd run typecheck` failed because `RegionOfInterest`
    was imported from `model/figure` instead of `model/roi`.
  - Resolution: Corrected the import path.
  - Retry count: 1
- **Validation**: `npm.cmd run typecheck` -> exit 0 after import fix.
- **Files changed**:
  - `src/app/useFigureComposerController.ts`
  - `src/app/App.tsx`
  - `src/app/Inspector.tsx`
  - `src/app/App.css`
- **Next step**: Milestone 5 Validate and close child task.

---

## Milestone 5: Validate and close child task

- **Status**: DONE
- **Started**: 18:41
- **Completed**: 18:43
- **What was done**:
  - Ran final automated checks.
  - Extracted visible error helpers to keep controller file size under 300 lines.
  - Verified touched source files stay below 300 lines.
  - Verified touched function spans stay at or below 50 lines.
  - Verified the local dev server returns HTTP 200.
- **Key decisions**:
  - Decision: Keep the Vite chunk size warning as non-blocking.
  - Reasoning: The build succeeds and this warning is unrelated to derived crop
    behavior.
- **Problems encountered**:
  - Problem: `useFigureComposerController.ts` reached 305 lines after crop UI
    wiring.
  - Resolution: Extracted visible error helpers into `src/app/visibleErrors.ts`.
  - Retry count: 0
- **Validation**:
  - `npm.cmd run test` -> exit 0, 5 files / 27 tests passed.
  - `npm.cmd run typecheck` -> exit 0.
  - `npm.cmd run build` -> exit 0 with Vite chunk size warning.
  - `git -c safe.directory="D:/code/Figure Composer" -c core.quotepath=false diff --check` -> exit 0.
  - Source file size check -> touched files all under 300 lines.
  - Function span check -> touched functions at or below 50 lines.
  - `Invoke-WebRequest http://127.0.0.1:5173/` -> HTTP 200.
- **Files changed**:
  - `src/editor/model/sourceImage.ts`
  - `src/editor/state/figureFactory.ts`
  - `src/editor/state/projectStore.ts`
  - `src/editor/state/historyStore.ts`
  - `src/editor/project/projectJson.ts`
  - `src/editor/project/projectJsonValidation.ts`
  - `src/editor/project/projectJson.test.ts`
  - `src/editor/state/projectStore.test.ts`
  - `src/platform/browser/derivedSourceCrop.ts`
  - `src/app/useFigureComposerController.ts`
  - `src/app/visibleErrors.ts`
  - `src/app/App.tsx`
  - `src/app/Inspector.tsx`
  - `src/app/App.css`
- **Next step**: Return to parent epic child #5.

---

## Final Summary

- **Total milestones**: 5
- **Completed**: 5
- **Failed + recovered**: 1
- **External unblock events**: 0
- **Total retries**: 1
- **Files created**: 5
- **Files modified**: 14
- **Key learnings**:
  - Source Image lineage belongs directly on Source Image because it travels
    with the asset through project JSON.
  - Crop asset generation belongs at the browser platform boundary; reducer
    logic should only receive already-created derived source input.
