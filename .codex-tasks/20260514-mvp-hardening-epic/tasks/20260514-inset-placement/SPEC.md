# Task Specification

## Task Shape

- **Shape**: `single-full`

## Goals

- Improve Figure Composer object placement so linked Insets can be placed next
  to their Source Image more naturally.
- Add snap guide behavior for moving and resizing Figure objects against canvas
  edges and other Figure objects.
- Keep object movement and resize bounded by the Figure canvas.

## Non-Goals

- Full panel automation.
- Scale Bar placement.
- General alignment/distribution tools beyond snap behavior.
- Derived Source Image operations.

## Constraints

- Preserve existing ROI and linked Inset behavior.
- Use pure domain helpers where possible so placement behavior is testable.
- Keep UI state explicit; no silent snapping fallback when a helper fails.
- Keep touched files under repository size/function limits.

## Environment

- **Project root**: `D:\code\Figure Composer`
- **Language/runtime**: TypeScript / React
- **Package manager**: npm
- **Test framework**: Vitest
- **Build command**: `npm.cmd run build`
- **Existing test count**: 8 tests

## Risk Assessment

- [x] External dependencies are not required.
- [x] Existing canvas behavior will be inspected before edits.
- [x] No large generated files are expected.
- [x] Unit test timeout remains 60 seconds for `npm.cmd run test`.

## Deliverables

- Domain placement helpers and reducer coverage for snap behavior.
- Canvas wiring so drag and resize operations use placement constraints.
- Visible snap guide feedback while dragging or resizing.
- Taskmaster progress updates and final validation.

## Done-When

- [ ] Insets can be docked adjacent to their linked Source Image and remain inside the Figure canvas.
- [ ] Moving and resizing Figure objects can snap to canvas and object edges.
- [ ] Snap guide behavior is visible during active drag or resize.
- [ ] `npm.cmd run test`, `npm.cmd run typecheck`, and `npm.cmd run build` pass.

## Final Validation Command

```powershell
npm.cmd run test
npm.cmd run typecheck
npm.cmd run build
```

## Demo Flow

1. Import a Source Image.
2. Create a Region Of Interest and linked Inset.
3. Drag the Inset near the Source Image and canvas edges.
4. Confirm snap guides appear and the object remains inside the canvas.
5. Resize the object and confirm bounds are respected.
