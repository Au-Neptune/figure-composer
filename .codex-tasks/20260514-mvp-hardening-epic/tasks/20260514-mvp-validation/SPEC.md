# Task Specification

## Task Shape

- **Shape**: `single-full`

## Goals

- Harden project validation beyond raw JSON shape checks.
- Add MVP smoke coverage for import, ROI, linked Inset, dock, save, reopen,
  export settings, undo, and redo.
- Close the MVP hardening epic only after final validation passes.

## Non-Goals

- Browser automation for File System Access API.
- TIFF, PDF, SVG, PowerPoint, or packed project export.
- Desktop packaging.
- Full visual regression testing.

## Constraints

- Keep failures explicit; invalid project references should throw clear errors.
- Keep smoke tests deterministic and independent of browser file pickers.
- Keep touched files under repository size and function-size limits.
- Preserve existing project JSON compatibility.

## Environment

- **Project root**: `D:\code\Figure Composer`
- **Language/runtime**: TypeScript / React
- **Package manager**: npm
- **Test framework**: Vitest
- **Build command**: `npm.cmd run build`

## Risk Assessment

- [x] External dependencies are not required.
- [x] Existing project JSON compatibility must remain intact.
- [x] Smoke coverage should not use mock success paths for export or save.
- [x] Unit test timeout remains 60 seconds for `npm.cmd run test`.

## Deliverables

- Semantic project reference validation.
- MVP smoke test covering core reducer/history/project JSON/export settings flow.
- Taskmaster progress updates and final epic validation.

## Done-When

- [ ] Invalid project references are rejected during project JSON parsing.
- [ ] MVP smoke path covers import, ROI, linked Inset, dock, save/reopen through
  project JSON, export PNG/JPG settings, undo, and redo.
- [ ] `npm.cmd run test`, `npm.cmd run typecheck`, and `npm.cmd run build` pass.

## Final Validation Command

```powershell
npm.cmd run test
npm.cmd run typecheck
npm.cmd run build
```
