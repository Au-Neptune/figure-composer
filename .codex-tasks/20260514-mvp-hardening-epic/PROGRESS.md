# Progress Log

> Auto-maintained by Taskmaster. This file is the context-recovery anchor for
> the Figure Composer MVP hardening epic.

---

## Session Start

- **Date**: 2026-05-14 17:49 +08:00
- **Task name**: `20260514-mvp-hardening-epic`
- **Task dir**: `.codex-tasks/20260514-mvp-hardening-epic/`
- **Spec**: See `EPIC.md`
- **Plan**: See `SUBTASKS.csv` (5 child deliverables)
- **Environment**: React / TypeScript / Vite / Konva / Vitest

---

## Context Recovery Block

> If resuming after compaction, session restart, or context loss, read this
> section first.

- **Current milestone**: #5 Harden MVP validation and smoke coverage
- **Current status**: WAITING_SUBTASK
- **Last completed**: #4 Implement derived source image crop
- **Current artifact**: `SUBTASKS.csv`
- **Key context**: The MVP vertical slice exists and is pushed. The next work
  should improve editing ergonomics before expanding image operations.
- **Known issues**: None blocking. Vite build reports a chunk size warning.
- **Next action**: Create `tasks/20260514-mvp-validation/` as a Full Single
  child task and begin row #5 from `SUBTASKS.csv`.

> Update this block every time a child deliverable changes status.

---

## Epic Planning

- **Status**: DONE
- **Started**: 17:49
- **Completed**: 17:49
- **What was done**:
  - Created the Taskmaster Epic directory and truth artifacts.
  - Converted the next MVP roadmap into five child deliverables with explicit
    dependencies and validation criteria.
- **Key decisions**:
  - Decision: Use Epic Task shape.
  - Reasoning: The roadmap spans separate editing, project model, export, and
    validation deliverables.
  - Alternatives considered: A single `TODO.csv`, rejected because it would
    mix independent deliverables and dependency chains in one execution stream.
- **Problems encountered**:
  - Problem: None.
  - Resolution: Not applicable.
  - Retry count: 0
- **Validation**: `Test-Path .codex-tasks/20260514-mvp-hardening-epic/EPIC.md`
  and related artifact checks should return `True`.
- **Files changed**:
  - `.codex-tasks/20260514-mvp-hardening-epic/EPIC.md` defines the epic.
  - `.codex-tasks/20260514-mvp-hardening-epic/SUBTASKS.csv` tracks child tasks.
  - `.codex-tasks/20260514-mvp-hardening-epic/PROGRESS.md` records recovery state.
- **Next step**: Child #1 Improve inset placement and snap guides.

---

## Child #1 Started: Improve inset placement and snap guides

- **Status**: IN_PROGRESS
- **Started**: 17:51
- **What was done**:
  - Marked `SUBTASKS.csv` row #1 as `IN_PROGRESS`.
  - Created Full Single child task artifacts under
    `tasks/20260514-inset-placement/`.
- **Validation**: Pending child task validation.
- **Next step**: Read child `TODO.csv` and inspect current canvas interaction code.

---

## Child #1 Completed: Improve inset placement and snap guides

- **Status**: DONE
- **Completed**: 18:01
- **What was done**:
  - Added testable placement snapping helpers for move and resize behavior.
  - Wired object drag and transformer bounds through snapping.
  - Added transient placement guide overlay lines during drag/resize.
  - Preserved canvas bounds and existing reducer persistence behavior.
- **Validation**:
  - `npm.cmd run test` -> exit 0, 4 files / 14 tests passed.
  - `npm.cmd run typecheck` -> exit 0.
  - `npm.cmd run build` -> exit 0 with Vite chunk size warning.
  - `git -c safe.directory="D:/code/Figure Composer" diff --check` -> exit 0.
  - `Invoke-WebRequest http://127.0.0.1:5173/` -> HTTP 200.
- **Files changed**:
  - `src/editor/model/placementSnapping.ts`
  - `src/editor/model/placementSnapping.test.ts`
  - `src/editor/canvas/FigureStage.tsx`
  - `src/editor/canvas/ObjectRenderer.tsx`
  - `src/editor/canvas/objectPlacementInteractions.ts`
  - `src/editor/canvas/PlacementGuideOverlay.tsx`
  - `src/editor/state/editorDefaults.ts`
- **Next step**: Child #2 Add source image management actions.

---

## Child #2 Started: Add source image management actions

- **Status**: IN_PROGRESS
- **Started**: 18:09
- **What was done**:
  - Marked `SUBTASKS.csv` row #2 as `IN_PROGRESS`.
  - Created Full Single child task artifacts under
    `tasks/20260514-source-image-management/`.
- **Validation**: Pending child task validation.
- **Next step**: Read child `TODO.csv` and inspect source image model, list UI,
  project JSON, and reducer command flow.

---

## Child #2 Completed: Add source image management actions

- **Status**: DONE
- **Completed**: 18:21
- **What was done**:
  - Added source image rename and delete reducer commands.
  - Made rename and delete undoable history actions.
  - Added reducer coverage for rename, invalid rename, unreferenced delete, and
    referenced delete blocking.
  - Added Source Image List rename and delete controls.
  - Routed UI actions through controller validation so blocked deletes are shown
    through the inspector error message.
- **Validation**:
  - `npm.cmd run test` -> exit 0, 4 files / 18 tests passed.
  - `npm.cmd run typecheck` -> exit 0.
  - `npm.cmd run build` -> exit 0 with Vite chunk size warning.
  - `git -c safe.directory="D:/code/Figure Composer" -c core.quotepath=false diff --check` -> exit 0.
  - Source file size and function span checks passed.
  - `Invoke-WebRequest http://127.0.0.1:5173/` -> HTTP 200.
- **Files changed**:
  - `src/editor/state/sourceImageCommands.ts`
  - `src/editor/state/projectStore.ts`
  - `src/editor/state/historyStore.ts`
  - `src/editor/state/projectStore.test.ts`
  - `src/app/useFigureComposerController.ts`
  - `src/app/App.tsx`
  - `src/app/Inspector.tsx`
  - `src/app/SourceImageList.tsx`
  - `src/app/SourceImageList.css`
- **Next step**: Child #3 Build export preview workflow.

---

## Child #3 Started: Build export preview workflow

- **Status**: IN_PROGRESS
- **Started**: 18:22
- **What was done**:
  - Marked `SUBTASKS.csv` row #3 as `IN_PROGRESS`.
  - Created Full Single child task artifacts under
    `tasks/20260514-export-preview/`.
- **Validation**: Pending child task validation.
- **Next step**: Read child `TODO.csv` and inspect export preset model, export
  dialog UI, renderer/export code, and current tests.

---

## Child #3 Completed: Build export preview workflow

- **Status**: DONE
- **Completed**: 18:32
- **What was done**:
  - Added export preview metric helpers and tests.
  - Added Export Preview rendering for Source Images, Insets, and ROI frames.
  - Added Output Size and Final Pixels summary to the export dialog.
  - Added Output Width and Output Height controls to the Export Preset editor.
  - Updated export rendering to use the same final pixel dimensions shown in
    the dialog.
  - Added reducer coverage for Export Preset and Figure Layout separation.
- **Validation**:
  - `npm.cmd run test` -> exit 0, 5 files / 24 tests passed.
  - `npm.cmd run typecheck` -> exit 0.
  - `npm.cmd run build` -> exit 0 with Vite chunk size warning.
  - `git -c safe.directory="D:/code/Figure Composer" -c core.quotepath=false diff --check` -> exit 0.
  - Source file size and function span checks passed.
  - `Invoke-WebRequest http://127.0.0.1:5173/` -> HTTP 200.
- **Files changed**:
  - `src/editor/export/exportPreview.ts`
  - `src/editor/export/exportPreview.test.ts`
  - `src/editor/export/exportFigure.ts`
  - `src/app/ExportPreview.tsx`
  - `src/app/ExportDialog.tsx`
  - `src/app/ExportDialog.css`
  - `src/app/ExportPresetEditor.tsx`
  - `src/editor/state/projectStore.test.ts`
- **Next step**: Child #4 Implement derived source image crop.

---

## Child #4 Started: Implement derived source image crop

- **Status**: IN_PROGRESS
- **Started**: 18:33
- **What was done**:
  - Marked `SUBTASKS.csv` row #4 as `IN_PROGRESS`.
  - Created Full Single child task artifacts under
    `tasks/20260514-derived-crop/`.
- **Validation**: Pending child task validation.
- **Next step**: Read child `TODO.csv` and inspect ROI/source model, project
  JSON serialization, image loading, and UI action surfaces.

---

## Child #4 Completed: Implement derived source image crop

- **Status**: DONE
- **Completed**: 18:43
- **What was done**:
  - Added Source Image lineage for imported and derived sources.
  - Added project JSON serialization, hydration, validation, and legacy
    compatibility for lineage.
  - Added browser crop asset helper for creating Derived Source Image PNG object
    URLs from ROI data.
  - Added reducer workflow and undoable history action for derived sources.
  - Added selected ROI crop action in the Inspector.
  - Extracted visible error helpers to keep controller size under limits.
- **Validation**:
  - `npm.cmd run test` -> exit 0, 5 files / 27 tests passed.
  - `npm.cmd run typecheck` -> exit 0.
  - `npm.cmd run build` -> exit 0 with Vite chunk size warning.
  - `git -c safe.directory="D:/code/Figure Composer" -c core.quotepath=false diff --check` -> exit 0.
  - Source file size and function span checks passed.
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
- **Next step**: Child #5 Harden MVP validation and smoke coverage.
