# Progress Log

---

## Session Start

- **Date**: 2026-05-14 18:22 +08:00
- **Task name**: `20260514-export-preview`
- **Task dir**: `.codex-tasks/20260514-mvp-hardening-epic/tasks/20260514-export-preview/`
- **Spec**: See `SPEC.md`
- **Plan**: See `TODO.csv` (5 milestones)
- **Environment**: React / TypeScript / Vite / Konva / Vitest

---

## Context Recovery Block

- **Current milestone**: #5 Validate and close child task
- **Current status**: DONE
- **Last completed**: #4 Preserve Figure Layout separation
- **Current artifact**: `TODO.csv`
- **Key context**: Epic child #3 is active. Source image management is complete
  and pushed at commit `3535e0d`.
- **Known issues**: Vite build reports a chunk size warning.
- **Next action**: Return to parent epic and begin child #4.

---

## Milestone 1: Inspect current export flow

- **Status**: DONE
- **Started**: 18:22
- **Completed**: 18:25
- **What was done**:
  - Created child task state.
  - Inspected `ExportDialog`, `ExportPresetEditor`, `FigureLayoutEditor`,
    `exportPreset`, export preset reducer commands, export renderer, and tests.
- **Key decisions**:
  - Decision: Add pure preview metrics before UI work.
  - Reasoning: The export dialog needs the same final pixel size and preview
    scaling data in rendering and validation.
  - Decision: Keep Figure Layout (`figure.canvas`) and Export Preset
    (`figure.exportPresets`) as separate state paths.
  - Reasoning: The existing model already separates them; the UI should expose
    this separation instead of mutating canvas settings from export controls.
- **Problems encountered**:
  - Problem: None.
  - Resolution: Not applicable.
  - Retry count: 0
- **Validation**: `git -c safe.directory="D:/code/Figure Composer" -c core.quotepath=false status --short` -> exit 0 with only child task artifacts modified.
- **Next step**: Milestone 2 Add testable export preview sizing helpers.

---

## Milestone 2: Add testable export preview sizing helpers

- **Status**: DONE
- **Started**: 18:25
- **Completed**: 18:26
- **What was done**:
  - Added `exportPreview` helper for output size, final pixel size, preview
    size, and preview scale.
  - Added Vitest coverage for DPI-derived pixel size, preview fitting, and
    output size separation from Figure Layout.
- **Key decisions**:
  - Decision: Final pixel size is derived from Export Preset output dimensions
    and DPI using the existing CSS screen DPI basis.
  - Reasoning: This preserves current high-DPI behavior while making output
    dimensions explicit.
- **Problems encountered**:
  - Problem: None.
  - Resolution: Not applicable.
  - Retry count: 0
- **Validation**: `npm.cmd run test` -> exit 0, 5 files / 22 tests passed.
- **Files changed**:
  - `src/editor/export/exportPreview.ts`
  - `src/editor/export/exportPreview.test.ts`
- **Next step**: Milestone 3 Render export preview and pixel size.

---

## Milestone 3: Render export preview and pixel size

- **Status**: DONE
- **Started**: 18:26
- **Completed**: 18:29
- **What was done**:
  - Added `ExportPreview` component for Source Image objects, Inset crop
    previews, and ROI frames.
  - Updated `ExportDialog` to show preview, Figure Layout, Output Size, and
    Final Pixels.
  - Replaced the textual close placeholder with a Lucide `X` icon.
- **Key decisions**:
  - Decision: Render export preview from the Figure model rather than cloning
    the editing canvas.
  - Reasoning: The preview uses output metrics while staying separate from the
    interactive Figure Preview.
- **Problems encountered**:
  - Problem: Initial patch did not match `ExportDialog.tsx` because existing
    non-ASCII multiplication symbols displayed inconsistently in PowerShell.
  - Resolution: Replaced the small file with ASCII display separators.
  - Retry count: 0
- **Validation**: `npm.cmd run test` -> exit 0, 5 files / 22 tests passed.
- **Files changed**:
  - `src/app/ExportPreview.tsx`
  - `src/app/ExportDialog.tsx`
  - `src/app/ExportDialog.css`
- **Next step**: Milestone 4 Preserve Figure Layout separation.

---

## Milestone 4: Preserve Figure Layout separation

- **Status**: DONE
- **Started**: 18:29
- **Completed**: 18:31
- **What was done**:
  - Added Output Width and Output Height controls to `ExportPresetEditor`.
  - Updated export rendering to use final pixel dimensions from the Export
    Preset.
  - Added reducer tests proving Export Preset size edits do not mutate Figure
    Layout and Figure Layout edits do not mutate Export Preset output size.
- **Key decisions**:
  - Decision: Actual export now renders to the same final pixel size shown in
    the dialog.
  - Reasoning: The preview and export action should share the same output-size
    contract.
- **Problems encountered**:
  - Problem: None.
  - Resolution: Not applicable.
  - Retry count: 0
- **Validation**:
  - `npm.cmd run typecheck` -> exit 0.
  - `npm.cmd run test` -> exit 0, 5 files / 24 tests passed.
- **Files changed**:
  - `src/app/ExportPresetEditor.tsx`
  - `src/editor/export/exportFigure.ts`
  - `src/editor/state/projectStore.test.ts`
- **Next step**: Milestone 5 Validate and close child task.

---

## Milestone 5: Validate and close child task

- **Status**: DONE
- **Started**: 18:31
- **Completed**: 18:32
- **What was done**:
  - Ran final automated checks.
  - Verified touched source files stay below 300 lines.
  - Verified touched function spans stay at or below 50 lines.
  - Verified the local dev server returns HTTP 200.
- **Key decisions**:
  - Decision: Keep the Vite chunk size warning as non-blocking.
  - Reasoning: The build succeeds and this warning is unrelated to export
    preview behavior.
- **Problems encountered**:
  - Problem: None.
  - Resolution: Not applicable.
  - Retry count: 0
- **Validation**:
  - `npm.cmd run test` -> exit 0, 5 files / 24 tests passed.
  - `npm.cmd run typecheck` -> exit 0.
  - `npm.cmd run build` -> exit 0 with Vite chunk size warning.
  - `git -c safe.directory="D:/code/Figure Composer" -c core.quotepath=false diff --check` -> exit 0.
  - Source file size check -> touched files all under 300 lines.
  - Function span check -> touched functions at or below 50 lines.
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
- **Next step**: Return to parent epic child #4.

---

## Final Summary

- **Total milestones**: 5
- **Completed**: 5
- **Failed + recovered**: 0
- **External unblock events**: 0
- **Total retries**: 0
- **Files created**: 6
- **Files modified**: 8
- **Key learnings**:
  - Export Preview is most stable when derived from Figure model data and
    Export Preset metrics rather than from the interactive canvas instance.
  - Output dimensions and Figure Layout dimensions need independent reducer
    coverage because both are width and height concepts with different meanings.
