# Task Specification

## Task Shape

- **Shape**: `single-full`

## Goals

- Allow the left Inspector panel and right Selection panel to be resized by dragging.
- Allow image files dragged onto the app page to import as Source Images.
- Keep export output dimensions synchronized with the current editor canvas size.
- Commit and push the finished changes to `origin/master`.

## Non-Goals

- Do not add persistent user preferences for panel widths.
- Do not add fallback/mock import behavior.
- Do not change export file rendering semantics beyond output size synchronization.

## Constraints

- React + TypeScript + Konva.
- Follow existing controller/reducer patterns.
- Keep source files under 300 lines and production functions under 50 lines.
- Surface import/export failures through existing visible error handling.

## Environment

- **Project root**: `D:\code\Figure Composer`
- **Language/runtime**: TypeScript / React
- **Package manager**: npm
- **Test framework**: Vitest
- **Build command**: `npm.cmd run build`
- **Existing test count**: 34 tests before this task

## Risk Assessment

- [x] External dependencies unavailable or unnecessary.
- [x] Breaking changes assessed through tests/typecheck/build.
- [x] Large file generation not involved.
- [x] Backend unit tests are not involved.

## Deliverables

- Draggable left and right workspace splitters.
- Page-level image drag/drop import flow.
- Export preset dimensions follow `figure.canvas.width` and `figure.canvas.height`.
- Updated task tracking and pushed git commit.

## Done-When

- [x] Left and right panel widths can be changed by dragging.
- [x] Dragging supported image files onto the app imports them as Source Images.
- [x] Export preview/output dimensions match the editor canvas size automatically.
- [x] `npm.cmd run test`, `npm.cmd run typecheck`, and `npm.cmd run build` pass.
- [x] Final commit is pushed to `origin/master`.

## Final Validation Command

```powershell
npm.cmd run test
npm.cmd run typecheck
npm.cmd run build
```

## Demo Flow

1. Drag the left and right panel dividers.
2. Drop one or more images onto the app workspace.
3. Resize the editor canvas and open Export.
4. Confirm output width/height match the current canvas.
