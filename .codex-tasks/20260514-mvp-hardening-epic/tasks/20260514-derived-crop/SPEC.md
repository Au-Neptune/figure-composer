# Task Specification

## Task Shape

- **Shape**: `single-full`

## Goals

- Implement a crop operation that creates a Derived Source Image.
- Preserve the original Source Image instead of mutating it.
- Preserve lineage for derived Source Images in project JSON.

## Non-Goals

- Full image operation history.
- Non-rectangular crop.
- Scientific image analysis or calibration.
- Batch crop automation.
- Scale Bar implementation.

## Constraints

- Derived crop must fail explicitly if required source or ROI data is missing.
- Do not silently rewrite existing Source Images, ROI data, or Inset objects.
- Keep derived lineage serialized and hydrated with project JSON.
- Keep browser workflow runnable without Tauri.
- Keep touched files under repository size and function-size limits.

## Environment

- **Project root**: `D:\code\Figure Composer`
- **Language/runtime**: TypeScript / React
- **Package manager**: npm
- **Test framework**: Vitest
- **Build command**: `npm.cmd run build`

## Risk Assessment

- [x] External dependencies are not required.
- [x] Project JSON compatibility must be preserved for existing imported sources.
- [x] Source asset creation must expose canvas/image failures explicitly.
- [x] Unit test timeout remains 60 seconds for `npm.cmd run test`.

## Deliverables

- Source image lineage model for imported and derived sources.
- Project JSON serialization and validation support for derived lineage.
- Crop helper that creates a new Source Image asset from a Region Of Interest.
- UI action to create a Derived Source Image from an existing ROI.
- Taskmaster progress updates and final validation.

## Done-When

- [ ] Cropping a ROI creates a new Source Image with its own asset URL and file name.
- [ ] The original Source Image is not mutated.
- [ ] Derived lineage is serialized in project JSON and hydrated on reopen.
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
3. Use the crop action for that Region Of Interest.
4. Confirm a new Derived Source Image appears in the Source Image List.
5. Save and reopen the project and confirm lineage remains in project JSON.
