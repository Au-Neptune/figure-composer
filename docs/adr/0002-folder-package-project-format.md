# Use a folder package for MVP projects

MVP projects will be stored as a folder package containing project metadata and required source assets, rather than as a single packed file. This keeps project contents inspectable and easy to debug while the figure model, ROI/inset linkage, export presets, and asset handling are still evolving.

**Considered Options**

- **Single packed file**: cleaner for end users, but requires packing, unpacking, migration, and recovery logic too early.
- **Loose references to files elsewhere on disk**: smaller project folders, but fragile when source images move or are deleted.
