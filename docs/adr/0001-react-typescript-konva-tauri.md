# Use React, TypeScript, Konva, and Tauri for the MVP

Figure Composer will use React and TypeScript for the interactive application UI, Konva for the WYSIWYG figure canvas, and Tauri for the desktop shell and local project file access. The editor will remain runnable in a browser development server; Tauri-specific behavior belongs behind local file and packaging adapters. This gives the MVP a typed UI codebase, an object-oriented canvas interaction model for source images, ROIs, insets, annotations, and guides, and a lightweight desktop packaging path without starting from native UI frameworks.

**Considered Options**

- **Electron instead of Tauri**: more mature and more consistent Chromium runtime, but heavier for a local academic utility.
- **Fabric.js instead of Konva**: strong object model and export support, but Konva is a better fit for explicit stage/layer/node interaction and React integration in this app.
- **Native desktop UI**: stronger OS integration, but slower to iterate on a complex canvas editor MVP.
