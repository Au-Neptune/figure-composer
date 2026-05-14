# Task Specification

## Task Shape

- **Shape**: `single-full`

## Goals

- Make ROI deletion explicit after a drag-created ROI/inset exists.
- Add direct drag resizing for the Figure Layout canvas.
- Add a right-side selection panel with selected image information and editable bounds.
- Simplify export entry labeling and show concrete JPG quality values.

## Non-Goals

- Do not change project file format unless the interaction model requires it.
- Do not add fallback export or mock rendering paths.
- Do not redesign the full app shell beyond the requested MVP usability fixes.

## Constraints

- React + TypeScript + Konva.
- Follow existing immutable reducer/action patterns.
- Keep source files under 300 lines and functions under 50 lines.
- Expose invalid state through explicit errors instead of silent fallbacks.

## Environment

- **Project root**: `D:\code\Figure Composer`
- **Language/runtime**: TypeScript / React
- **Package manager**: npm
- **Test framework**: Vitest
- **Build command**: `npm.cmd run build`
- **Existing test count**: 32 tests before this task

## Risk Assessment

- [x] External dependencies unavailable or unnecessary.
- [x] Breaking changes to existing code assessed through reducer and smoke tests.
- [x] Large file generation not involved.
- [x] Backend unit tests are not involved; frontend checks use normal npm scripts.

## Deliverables

- ROI delete command and visible UI control.
- Canvas resize handle on the Konva stage.
- Right-side selected image panel with editable x/y/width/height values.
- Export toolbar label and JPG quality value display updates.
- Focused reducer/smoke coverage for the new state transitions.

## Done-When

- [x] ROI can be deleted without relying on undo, and linked inset/reference state stays valid.
- [x] Canvas dimensions can be changed by dragging a canvas handle.
- [x] The right panel shows selected image metadata and updates object bounds.
- [x] Export entry point no longer implies a fixed format, and JPG quality shows a visible numeric value.
- [x] `npm.cmd run test`, `npm.cmd run typecheck`, and `npm.cmd run build` pass.

## Final Validation Command

```powershell
npm.cmd run test
npm.cmd run typecheck
npm.cmd run build
```

## Demo Flow

1. Import an image.
2. Drag-create an ROI/inset, select the ROI, delete it from the panel.
3. Drag the canvas resize handle.
4. Select a source image and edit its bounds from the right panel.
5. Open Export and adjust format/JPG quality.
