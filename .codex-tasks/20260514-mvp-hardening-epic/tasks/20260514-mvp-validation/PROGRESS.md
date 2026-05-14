# Progress Log

---

## Session Start

- **Date**: 2026-05-14 18:45 +08:00
- **Task name**: `20260514-mvp-validation`
- **Task dir**: `.codex-tasks/20260514-mvp-hardening-epic/tasks/20260514-mvp-validation/`
- **Spec**: See `SPEC.md`
- **Plan**: See `TODO.csv` (5 milestones)
- **Environment**: React / TypeScript / Vite / Konva / Vitest

---

## Context Recovery Block

- **Current milestone**: #5 Validate and close epic
- **Current status**: DONE
- **Last completed**: #4 Run integrated static validation
- **Current artifact**: `TODO.csv`
- **Key context**: Epic child #5 is active. Feature children #1-#4 are complete
  and pushed through commit `05144ef`.
- **Known issues**: Vite build reports a chunk size warning.
- **Next action**: Return to parent epic and mark the epic complete.

---

## Milestone 1: Inspect current validation and smoke coverage

- **Status**: DONE
- **Started**: 18:45
- **Completed**: 18:46
- **What was done**:
  - Created child task state.
  - Inspected project JSON validation, project JSON tests, reducer tests,
    history tests, export preview tests, and action coverage.
- **Key decisions**:
  - Decision: Add semantic project reference validation outside the parser file.
  - Reasoning: `projectJsonValidation.ts` is already close to the 300-line file
    limit and should remain focused on structural parsing.
  - Decision: Add one integration-style smoke test instead of duplicating every
    reducer unit path.
  - Reasoning: Existing unit tests cover narrow commands; the gap is the full
    MVP workflow across history, project JSON, and export settings.
- **Problems encountered**:
  - Problem: None.
  - Resolution: Not applicable.
  - Retry count: 0
- **Validation**: `git -c safe.directory="D:/code/Figure Composer" -c core.quotepath=false status --short` -> exit 0 with only child task artifacts modified.
- **Next step**: Milestone 2 Add semantic project reference validation.

---

## Milestone 2: Add semantic project reference validation

- **Status**: DONE
- **Started**: 18:46
- **Completed**: 18:48
- **What was done**:
  - Added `projectReferences` semantic validator.
  - Wired semantic validation into `parseProjectJsonText`.
  - Added tests for missing Source Image, missing Source Image object, missing
    ROI, and stale `referencedBy` links.
- **Key decisions**:
  - Decision: Validate derived lineage ROI and parent source references.
  - Reasoning: Lineage should fail at project open time if it points to missing
    project state.
- **Problems encountered**:
  - Problem: Existing derived-lineage test fixture used `roi_test` without a
    matching ROI after semantic validation was added.
  - Resolution: Updated the fixture to build derived lineage from a real linked
    ROI.
  - Retry count: 1
- **Validation**: `npm.cmd run test` -> exit 0, 6 files / 31 tests passed.
- **Files changed**:
  - `src/editor/project/projectReferences.ts`
  - `src/editor/project/projectReferences.test.ts`
  - `src/editor/project/projectJsonValidation.ts`
  - `src/editor/project/projectJson.test.ts`
- **Next step**: Milestone 3 Add MVP smoke workflow coverage.

---

## Milestone 3: Add MVP smoke workflow coverage

- **Status**: DONE
- **Started**: 18:48
- **Completed**: 18:49
- **What was done**:
  - Added integration-style MVP smoke test covering import, ROI, linked Inset,
    dock, save/reopen through project JSON, PNG export metrics, JPG export
    settings, undo, and redo.
- **Key decisions**:
  - Decision: Use project JSON serialization and hydration as the save/reopen
    boundary.
  - Reasoning: Browser file pickers cannot be exercised deterministically in a
    unit test, but project JSON covers the persisted data contract.
- **Problems encountered**:
  - Problem: First smoke test run passed a `HistoryState` to a helper expecting
    a `Figure` in undo/redo assertions.
  - Resolution: Asserted against `undone.present` and `redone.present`.
  - Retry count: 1
- **Validation**: `npm.cmd run test` -> exit 0, 7 files / 32 tests passed.
- **Files changed**:
  - `src/editor/state/mvpSmoke.test.ts`
- **Next step**: Milestone 4 Run integrated static validation.

---

## Milestone 4: Run integrated static validation

- **Status**: DONE
- **Started**: 18:49
- **Completed**: 18:50
- **What was done**:
  - Ran typecheck.
  - Checked touched source files stay below 300 lines.
  - Checked touched function spans stay at or below 50 lines.
- **Problems encountered**:
  - Problem: None.
  - Resolution: Not applicable.
  - Retry count: 0
- **Validation**:
  - `npm.cmd run typecheck` -> exit 0.
  - Source file size check -> touched files all under 300 lines.
  - Function span check -> touched functions at or below 50 lines.
- **Next step**: Milestone 5 Validate and close epic.

---

## Milestone 5: Validate and close epic

- **Status**: DONE
- **Started**: 18:50
- **Completed**: 18:52
- **What was done**:
  - Ran final automated checks.
  - Split `LoadedFigureObject` interaction handlers so all source functions stay
    at or below 50 lines.
  - Verified all source files stay below 300 lines.
  - Verified the local dev server returns HTTP 200.
- **Key decisions**:
  - Decision: Treat Vite chunk size warning as non-blocking.
  - Reasoning: The build succeeds and this warning is a performance follow-up,
    not a failed MVP smoke or validation check.
- **Problems encountered**:
  - Problem: Full source function-span check found `LoadedFigureObject` exceeded
    the 50-line function limit.
  - Resolution: Extracted `createObjectInteractionHandlers`.
  - Retry count: 0
- **Validation**:
  - `npm.cmd run test` -> exit 0, 7 files / 32 tests passed.
  - `npm.cmd run typecheck` -> exit 0.
  - `npm.cmd run build` -> exit 0 with Vite chunk size warning.
  - `git -c safe.directory="D:/code/Figure Composer" -c core.quotepath=false diff --check` -> exit 0.
  - Full source file size check -> no files over 300 lines.
  - Full source function span check -> no functions over 50 lines.
  - `Invoke-WebRequest http://127.0.0.1:5173/` -> HTTP 200.
- **Files changed**:
  - `src/editor/project/projectReferences.ts`
  - `src/editor/project/projectReferences.test.ts`
  - `src/editor/project/projectJsonValidation.ts`
  - `src/editor/project/projectJson.test.ts`
  - `src/editor/state/mvpSmoke.test.ts`
  - `src/editor/canvas/ObjectRenderer.tsx`
- **Next step**: Close parent epic.

---

## Final Summary

- **Total milestones**: 5
- **Completed**: 5
- **Failed + recovered**: 2
- **External unblock events**: 0
- **Total retries**: 2
- **Files created**: 6
- **Files modified**: 6
- **Key learnings**:
  - Semantic project validation catches broken references at project open time
    instead of letting rendering fail later.
  - A single smoke workflow provides useful confidence across reducer history,
    project JSON persistence, export settings, undo, and redo.
