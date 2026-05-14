import type { Figure } from "../editor/model/figure";
import type { ImportedSourceImage } from "../editor/model/sourceImage";

export interface FigureComposerPlatform {
  readonly projectFolders: ProjectFolderAdapter;
  readonly sourceImageFiles: SourceImageFileAdapter;
}

export interface ProjectFolderAdapter {
  readonly saveProjectFolder: (figure: Figure) => Promise<void>;
  readonly openProjectFolder: () => Promise<Figure>;
}

export interface SourceImageFileAdapter {
  readonly readImageFile: (file: File) => Promise<ImportedSourceImage>;
}
