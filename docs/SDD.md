# Figure Composer Software Design Document

## Purpose

Figure Composer is a desktop-first tool for composing publication- and report-ready figures from source images, linked insets, ROI frames, annotations, and export presets.

The product is focused on **Figure** composition, not general photo editing or scientific image analysis. Image operations exist only when they support figure composition, layout, and output.

## Goals

- Compose a report- or paper-ready **Figure** from one or more **Source Images**.
- Create a **Region Of Interest** on a **Source Image** and generate a linked **Inset**.
- Show a default red **ROI Frame** on the source image when an inset is created.
- Let users freely arrange source images, insets, and annotations on a WYSIWYG canvas.
- Export the current figure using reusable **Export Presets**.
- Save and reopen work as a portable **Project** package.

## Non-Goals For MVP

- Scientific image analysis such as thresholding, measurement analysis, channel analysis, or ImageJ/Fiji-style workflows.
- Photoshop-style retouching, brush editing, object removal, or filter-heavy photo editing.
- Full panel automation, including automatic panel ordering and relabeling.
- Scale Bar implementation, even though **Scale Bar** is a core domain concept.
- TIFF, PDF, SVG, or PowerPoint export.
- Single-file packed project format.
- Export artifact history.

## Domain Model

The canonical domain language is defined in [CONTEXT.md](../CONTEXT.md).

Key concepts:

- **Project**: A portable package containing one **Figure** and its required source assets.
- **Figure**: The primary composed artifact intended for a paper, report, presentation, or poster.
- **Source Image**: Imported image material used inside a figure.
- **Referenced Source Image**: A source image that is used by a ROI, inset, or scale bar and can no longer be directly modified.
- **Derived Source Image**: A new source image created from a figure-safe image operation.
- **Region Of Interest**: A selected area on a source image that drives a linked inset.
- **ROI Frame**: A visible annotation marking a ROI, created by default when an inset is created.
- **Inset**: A linked visual element showing a magnified or cropped ROI.
- **Export Preset**: Reusable output settings for exporting a figure.
- **Figure Preview**: The WYSIWYG editing canvas.
- **Export Preview**: A pre-export view for checking output settings.

## Confirmed Product Decisions

- The core artifact is a **Figure**, not a generic image or collage.
- A **Project** contains exactly one **Figure**.
- A **Project** is a folder package, not loose external references and not a single packed file for MVP.
- A **Figure** may contain multiple **Source Images**.
- The MVP supports multiple source images with free layout, but not full panel automation.
- **Inset** is linked to its **Region Of Interest** by default.
- Creating an inset automatically creates a default visible red **ROI Frame**.
- ROI semantics and ROI visual frame are separate concepts.
- Inset sizing uses display size by default.
- Inset magnification exists as a precision concept, but display size is the default user workflow.
- **Source Image** may be directly modified only before it is referenced.
- Once a source image is referenced by ROI, inset, or scale bar, direct modification is blocked.
- Further edits to a referenced source image produce a **Derived Source Image**.
- **Scale Bar** is a core concept, but not part of the MVP implementation.
- **Export Preset** is stored in the project.
- Exported output files are not tracked as project history.
- The editor uses a WYSIWYG **Figure Preview**.
- A separate **Export Preview** appears before export.
- **Image Operations** are limited to figure-safe operations.

## MVP Scope

The first vertical slice is:

1. Import a **Source Image**.
2. Display the source image on the WYSIWYG figure canvas.
3. Create a **Region Of Interest** on the source image.
4. Automatically create a default red **ROI Frame**.
5. Generate a linked **Inset** from the ROI.
6. Keep the inset updated when the ROI changes.
7. Arrange the inset freely on the canvas.
8. Export the figure as PNG.

The MVP should then expand to:

- Multiple source images on the same figure canvas.
- Basic object movement and resizing.
- JPG export.
- Export presets for canvas size, DPI, format, background, and JPG quality.
- Project save/load using folder packages.
- Core undo/redo for editing operations.

Current undo/redo coverage includes project-level editing commands: importing a
Source Image, creating a linked Inset from a Region Of Interest, moving or
resizing Figure objects, changing a Region Of Interest, and editing the active
Export Preset. Selection changes, tool changes, saving, exporting, and opening a
Project are not tracked as undoable edits. Opening a Project resets history.

Current editor layout behavior keeps Figure Layout separate from Export Presets.
Figure canvas width, height, and background are edited as Figure Layout settings
while export format, DPI raster scale, and JPG quality are confirmed at export
time. Source Images and Insets are constrained to the Figure canvas; ROI Frames
are constrained to their Source Image. Selected Insets can be docked to the top,
right, bottom, or left side of their linked Source Image. The Inspector lists
all Source Images so users can reselect the original image object directly when
working with multiple canvas objects. Generic Annotation text objects can be
added from the toolbar, moved and resized on the Figure canvas, saved in the
Project, and included in Export Preview output.

## MVP Image Operations

MVP image operations are limited to:

- Crop.
- Resize.
- Rotate 90, 180, or 270 degrees.
- Format conversion through export.
- Canvas size and DPI through export presets.

Current implementation creates **Derived Source Images** for figure-safe
operations instead of mutating referenced Source Images. Supported user actions
currently include cropping a ROI into a new Source Image, creating a 50% resized
Derived Source Image, and creating a 90 degree rotated Derived Source Image.
Derived Source Image lineage records explicit `crop`, `resize`, or `rotate`
operations, with legacy crop fields preserved for old project files.

Deferred image operations:

- Brightness and contrast.
- Grayscale conversion.
- Transparent background processing.
- Arbitrary rotation.
- Trim whitespace.
- Advanced compression controls beyond basic JPG quality.

## MVP Export

Supported in MVP:

- PNG.
- JPG.

Current browser implementation uses the current Figure Layout for exported
canvas dimensions and background. The active **Export Preset** controls output
format, DPI raster scale, and JPG quality. DPI controls export pixel ratio and
is written into PNG outputs as `pHYs` density metadata and JPG outputs as JFIF
density metadata. Malformed export data or unsupported metadata conditions fail
with explicit errors.

Deferred:

- TIFF.
- PDF.
- SVG.
- PowerPoint.

## Architecture

The MVP uses:

- React for UI composition.
- TypeScript for type safety.
- Konva for the interactive WYSIWYG canvas.
- Tauri for desktop packaging and local file access.
- A browser development server for fast editor iteration.

Tauri-specific behavior must stay behind adapters. The figure editor should remain runnable in a browser development server without depending directly on Tauri APIs.

Current platform boundaries:

- Browser development uses the File System Access API through a browser project folder adapter.
- Desktop builds use a Tauri shell with native folder dialogs and Rust commands for folder package reads and writes.
- App/controller code depends on injected platform adapters, not directly on browser or Tauri APIs.
- Tauri native compilation requires Rust 1.77.2 or newer, matching the current Tauri plugin requirement.

Architecture decision records:

- [ADR 0001: Use React, TypeScript, Konva, and Tauri for the MVP](./adr/0001-react-typescript-konva-tauri.md)
- [ADR 0002: Use a folder package for MVP projects](./adr/0002-folder-package-project-format.md)

## Proposed Module Boundaries

```txt
src/
  app/
    App.tsx
    routes/
  editor/
    canvas/
      FigureStage.tsx
      ObjectRenderer.tsx
      toolEvents.ts
    tools/
      selectTool.ts
      roiTool.ts
    model/
      figure.ts
      sourceImage.ts
      roi.ts
      inset.ts
      exportPreset.ts
    state/
      projectStore.ts
      historyStore.ts
    image/
      loadImageAsset.ts
      cropRoi.ts
      createDerivedSourceImage.ts
    export/
      exportPng.ts
      exportJpg.ts
    project/
      projectPackage.ts
      projectJson.ts
  platform/
    browser/
      fileAdapter.ts
    tauri/
      fileAdapter.ts
```

## State Principles

- The project model is the source of truth.
- Canvas objects render from project state.
- ROI and inset linkage is represented in state, not as copied pixels only.
- Source image mutation rules are explicit.
- Referenced source images are immutable.
- Derived source images preserve lineage without replacing their source.
- Undo/redo should operate on project-level editing commands, not hidden fallback behavior.

## Export Principles

- Export uses the current figure state and selected export preset.
- Export presets are saved with the project.
- Exported files are not saved as project history.
- Export preview validates size, DPI, format, and background before producing an output file.

## MVP Project Package

MVP projects are saved as folder packages:

```txt
Project Folder/
  project.json
  assets/
    <source-image-id>_<sanitized-original-name>.<ext>
```

`project.json` stores the serialized figure model, ROI/inset linkage, export
presets, and each Source Image's `assetFileName`. Runtime-only object URLs are
not written to `project.json`; they are rebuilt from `assets/` when a project is
opened.

The browser development adapter uses the File System Access API for folder
selection and local file writes. If that API is unavailable, project save/load
fails with an explicit error instead of silently switching to a different
package format.

The Tauri desktop adapter uses native folder selection and Rust file IO for the
same folder package format. The frontend sends the serialized `project.json` and
Source Image asset bytes to native commands when saving; opening a project reads
`project.json` and required assets natively, then recreates runtime object URLs
inside the WebView.

## Open Questions

- Whether linked inset precision mode is implemented in MVP or deferred after display-size mode.
