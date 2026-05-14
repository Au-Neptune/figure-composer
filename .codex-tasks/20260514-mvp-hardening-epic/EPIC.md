# Figure Composer MVP Hardening Epic

## Goal

- Bring Figure Composer from the current MVP vertical slice to a more humane,
  testable figure-composition editor by improving object placement, source image
  management, export preview, derived image operations, and validation coverage.

## Non-Goals

- Scale Bar implementation.
- TIFF, PDF, SVG, PowerPoint, or single-file packed project export.
- Full panel automation, automatic relabeling, or full scientific image analysis.
- Desktop packaging release work unless required to validate the MVP workflow.

## Constraints

- Keep React, TypeScript, Vite, Konva, and Vitest as the current stack.
- Keep browser development workflow runnable without direct Tauri dependency.
- Follow the repository debug-first rule: no silent fallback or fake success path.
- Keep files under 300 lines and functions under 50 lines unless split first.
- Validate child deliverables with automated checks before marking them `DONE`.
- Use git commits and push completed progress to the configured remote.

## Risk Assessment

- Canvas interactions can regress ROI, inset, drag, resize, and selection behavior.
- Source Image mutation rules must not break project JSON save/load compatibility.
- Export preview can blur the boundary between Figure Layout and output-only
  settings if the state model is not kept explicit.
- Derived Source Image work touches model, project serialization, and UI together,
  so it should follow source management and validation improvements.

## Child Deliverables

- Improve inset placement and snap guides.
- Add source image management actions.
- Build export preview workflow.
- Implement derived source image crop.
- Harden MVP validation and smoke coverage.

## Dependency Notes

- Derived Source Image crop depends on source image management rules.
- Final validation depends on all feature child tasks.
- `depends_on` uses `;` as delimiter for multiple IDs.

## Child Task Types

- `single-full` for all child deliverables because they involve code changes,
  validation, and recovery-safe task state.

## Done-When

- [x] Every row in `SUBTASKS.csv` is `DONE`.
- [x] Final MVP smoke workflow passes: import, ROI, linked inset, dock, save,
      reopen, export PNG/JPG, undo, and redo.
- [x] `npm.cmd run test`, `npm.cmd run typecheck`, and `npm.cmd run build` pass.
