# Task Specification

## Task Shape

- **Shape**: `single-full`

## Goals

- Build an export preview workflow inside the export dialog.
- Show final export pixel size clearly before export.
- Keep Figure Layout canvas settings separate from output-only export settings.

## Non-Goals

- New export formats.
- TIFF, PDF, SVG, PowerPoint, or packed project export.
- Full print layout automation.
- Large renderer refactors unrelated to preview and output size.

## Constraints

- Preserve existing PNG and JPG export behavior.
- Keep export preset state explicit and undoable where it already is.
- Do not mutate Figure Layout canvas dimensions when editing export dimensions.
- Keep preview math testable outside React components.
- Keep touched files under repository size and function-size limits.

## Environment

- **Project root**: `D:\code\Figure Composer`
- **Language/runtime**: TypeScript / React
- **Package manager**: npm
- **Test framework**: Vitest
- **Build command**: `npm.cmd run build`

## Risk Assessment

- [x] External dependencies are not required.
- [x] Export preset and canvas layout boundaries must be inspected before edits.
- [x] Preview should not create fake export success paths.
- [x] Unit test timeout remains 60 seconds for `npm.cmd run test`.

## Deliverables

- Testable export preview sizing helpers.
- Export dialog preview UI.
- Final pixel size display.
- Clear separation between Figure Layout canvas settings and output-only export
  preset settings.
- Taskmaster progress updates and final validation.

## Done-When

- [ ] Export dialog shows a preview of the figure output.
- [ ] Export dialog shows final pixel dimensions derived from export settings.
- [ ] Editing export settings does not change Figure Layout canvas dimensions.
- [ ] `npm.cmd run test`, `npm.cmd run typecheck`, and `npm.cmd run build` pass.

## Final Validation Command

```powershell
npm.cmd run test
npm.cmd run typecheck
npm.cmd run build
```

## Demo Flow

1. Import a Source Image.
2. Open Export.
3. Change export width, height, DPI, format, and background.
4. Confirm the preview and final pixel size update.
5. Confirm Figure Layout dimensions in the inspector do not change.
