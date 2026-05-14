import type { FigureComposerPlatform } from "../appPlatform";
import { readImageFile } from "../browser/fileAdapter";
import { tauriProjectFolderAdapter } from "./projectFolderAdapter";

export const tauriPlatform: FigureComposerPlatform = {
  projectFolders: tauriProjectFolderAdapter,
  sourceImageFiles: {
    readImageFile,
  },
};
