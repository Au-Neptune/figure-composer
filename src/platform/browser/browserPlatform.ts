import type { FigureComposerPlatform } from "../appPlatform";
import { readImageFile } from "./fileAdapter";
import {
  openProjectFolder,
  saveProjectFolder,
} from "./projectFolderAdapter";

export const browserPlatform: FigureComposerPlatform = {
  projectFolders: {
    openProjectFolder,
    saveProjectFolder,
  },
  sourceImageFiles: {
    readImageFile,
  },
};
