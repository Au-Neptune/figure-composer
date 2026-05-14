# Task Specification

## Task Shape

- **Shape**: `single-full`

## Goals

- Add source image management actions to the editor.
- Allow users to rename source images without breaking project references.
- Allow users to delete source images only when they are unreferenced.
- Surface explicit blocking errors when a delete is blocked by existing figure
  object references.

## Non-Goals

- Derived source image crop.
- Bulk source image operations.
- Source image replacement or reimport.
- Full asset library organization.

## Constraints

- Preserve project JSON save/load compatibility.
- Keep source image reference rules explicit and testable.
- Do not silently remove, rewrite, or repair figure objects during source image
  deletion.
- Keep touched files under repository size and function-size limits.

## Environment

- **Project root**: `D:\code\Figure Composer`
- **Language/runtime**: TypeScript / React
- **Package manager**: npm
- **Test framework**: Vitest
- **Build command**: `npm.cmd run build`

## Risk Assessment

- [x] External dependencies are not required.
- [x] Source image references must be inspected before deletion behavior changes.
- [x] UI errors must expose blocked deletion clearly rather than degrading silently.
- [x] Unit test timeout remains 60 seconds for `npm.cmd run test`.

## Deliverables

- Testable model or state helpers for source image rename and delete rules.
- UI controls for renaming and deleting source images from the source image list.
- Explicit delete-blocked error behavior for referenced source images.
- Taskmaster progress updates and final validation.

## Done-When

- [ ] A source image can be renamed and all existing references remain valid.
- [ ] An unreferenced source image can be deleted.
- [ ] A referenced source image cannot be deleted and reports an explicit error.
- [ ] `npm.cmd run test`, `npm.cmd run typecheck`, and `npm.cmd run build` pass.

## Final Validation Command

```powershell
npm.cmd run test
npm.cmd run typecheck
npm.cmd run build
```

## Demo Flow

1. Import two Source Images.
2. Rename one Source Image and confirm figure objects still render.
3. Delete an unused Source Image.
4. Attempt to delete a Source Image used by an Image, ROI, or Inset object.
5. Confirm the delete operation is blocked with a clear error.
