# Progress Log

---

## Session Start

- **Date**: 2026-05-14 18:09 +08:00
- **Task name**: `20260514-source-image-management`
- **Task dir**: `.codex-tasks/20260514-mvp-hardening-epic/tasks/20260514-source-image-management/`
- **Spec**: See `SPEC.md`
- **Plan**: See `TODO.csv` (5 milestones)
- **Environment**: React / TypeScript / Vite / Konva / Vitest

---

## Context Recovery Block

- **Current milestone**: #5 Validate and close child task
- **Current status**: DONE
- **Last completed**: #4 Wire delete action into state and UI
- **Current artifact**: `TODO.csv`
- **Key context**: Epic child #2 is active. The task adds source image rename
  and explicit deletion rules before derived image crop work begins.
- **Known issues**: Vite build reports a chunk size warning.
- **Next action**: Return to parent epic and begin child #3.

---

## Milestone 1: Inspect source image model and UI flow

- **Status**: DONE
- **Started**: 18:09
- **Completed**: 18:13
- **What was done**:
  - Created child task state.
  - Inspected `sourceImage`, `figure`, project JSON, reducer commands, source
    image list UI, history, and current reducer tests.
- **Key decisions**:
  - Decision: Implement source image management as explicit reducer commands.
  - Reasoning: Rename and delete are project edits that must participate in
    undo/redo and save/load without implicit reference repair.
  - Decision: Treat ROI and Inset references as deletion blockers while allowing
    deletion to remove the primary Source Image object for an otherwise
    unreferenced image.
  - Reasoning: Imported images begin with `referencedBy: []` but always have a
    primary canvas object; that object is the editable placement of the source,
    not a dependent derived reference.
- **Problems encountered**:
  - Problem: Plain `git status` fails because the repository requires an
    explicit safe directory override.
  - Resolution: Use `git -c safe.directory="D:/code/Figure Composer"` for git
    validation commands.
  - Retry count: 0
- **Validation**: `git -c safe.directory="D:/code/Figure Composer" -c core.quotepath=false status --short` -> exit 0.
- **Next step**: Milestone 2 Add testable source image management rules.

---

## Milestone 2: Add testable source image management rules

- **Status**: DONE
- **Started**: 18:13
- **Completed**: 18:15
- **What was done**:
  - Added `sourceImageCommands` for rename, deletion, and shared validation.
  - Added reducer actions for `sourceImageRenamed` and `sourceImageDeleted`.
  - Made source image rename and delete undoable history actions.
  - Added reducer tests for rename, empty rename rejection, unreferenced delete,
    and referenced delete blocking.
- **Key decisions**:
  - Decision: Deletion blocks on `referencedBy`, ROIs, and Inset objects, but
    removes the primary Source Image object when no dependent references exist.
  - Reasoning: This matches the current model where imported sources start with
    no dependent references while still having a placement object on the canvas.
- **Problems encountered**:
  - Problem: None.
  - Resolution: Not applicable.
  - Retry count: 0
- **Validation**: `npm.cmd run test` -> exit 0, 4 files / 18 tests passed.
- **Files changed**:
  - `src/editor/state/sourceImageCommands.ts`
  - `src/editor/state/projectStore.ts`
  - `src/editor/state/historyStore.ts`
  - `src/editor/state/projectStore.test.ts`
- **Next step**: Milestone 3 Wire rename action into state and UI.

---

## Milestone 3: Wire rename action into state and UI

- **Status**: DONE
- **Started**: 18:15
- **Completed**: 18:17
- **What was done**:
  - Split `useFigureComposerController` into shorter handler construction.
  - Added a visible rename form to `SourceImageList`.
  - Routed rename through `App`, `Inspector`, controller validation, and the
    reducer action.
- **Key decisions**:
  - Decision: Controller handlers return a boolean for user-edit commands.
  - Reasoning: The UI can keep the edit form open when validation fails while
    still showing an explicit error message.
- **Problems encountered**:
  - Problem: None.
  - Resolution: Not applicable.
  - Retry count: 0
- **Validation**: `npm.cmd run test` -> exit 0, 4 files / 18 tests passed.
- **Files changed**:
  - `src/app/useFigureComposerController.ts`
  - `src/app/App.tsx`
  - `src/app/Inspector.tsx`
  - `src/app/SourceImageList.tsx`
  - `src/app/SourceImageList.css`
- **Next step**: Milestone 4 Wire delete action into state and UI.

---

## Milestone 4: Wire delete action into state and UI

- **Status**: DONE
- **Started**: 18:17
- **Completed**: 18:18
- **What was done**:
  - Added controller delete validation and dispatch handling.
  - Routed delete through `App`, `Inspector`, and `SourceImageList`.
  - Added a visible delete icon action that remains clickable so referenced
    images surface explicit blocking errors.
- **Key decisions**:
  - Decision: Do not disable the delete button for referenced images.
  - Reasoning: The task requires an explicit blocked-delete error path, and a
    disabled control would hide the validation result.
- **Problems encountered**:
  - Problem: First `npm.cmd run typecheck` failed because controller handler
    options typed `dispatch` as `Dispatch<ProjectAction>` while undo/redo also
    require `HistoryAction`.
  - Resolution: Typed the controller and source image handler dispatch as
    `Dispatch<HistoryAction>`.
  - Retry count: 1
- **Validation**: `npm.cmd run typecheck` -> exit 0 after the dispatch type fix.
- **Files changed**:
  - `src/app/useFigureComposerController.ts`
  - `src/app/App.tsx`
  - `src/app/Inspector.tsx`
  - `src/app/SourceImageList.tsx`
  - `src/app/SourceImageList.css`
- **Next step**: Milestone 5 Validate and close child task.

---

## Milestone 5: Validate and close child task

- **Status**: DONE
- **Started**: 18:18
- **Completed**: 18:21
- **What was done**:
  - Ran final automated checks.
  - Verified touched source files stay below 300 lines.
  - Verified touched function spans stay at or below 50 lines.
  - Verified the local dev server returns HTTP 200.
- **Key decisions**:
  - Decision: Keep the Vite chunk size warning as non-blocking.
  - Reasoning: The build succeeds and this warning is unrelated to source image
    management behavior.
- **Problems encountered**:
  - Problem: `SourceImageItem` initially exceeded the 50-line function limit.
  - Resolution: Split display rendering into `SourceImageDisplay`.
  - Retry count: 0
- **Validation**:
  - `npm.cmd run test` -> exit 0, 4 files / 18 tests passed.
  - `npm.cmd run typecheck` -> exit 0.
  - `npm.cmd run build` -> exit 0 with Vite chunk size warning.
  - `git -c safe.directory="D:/code/Figure Composer" -c core.quotepath=false diff --check` -> exit 0.
  - Source file size check -> touched files all under 300 lines.
  - Function span check -> touched functions at or below 50 lines.
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
- **Next step**: Return to parent epic child #3.

---

## Final Summary

- **Total milestones**: 5
- **Completed**: 5
- **Failed + recovered**: 1
- **External unblock events**: 0
- **Total retries**: 1
- **Files created**: 2
- **Files modified**: 10
- **Key learnings**:
  - Source image deletion should block on dependent ROI and Inset references,
    while allowing removal of the primary canvas object for unreferenced sources.
  - Controller-level validation lets user-facing operations show explicit errors
    without relying on reducer exceptions to surface through React rendering.
