import type { ChangeEvent, Dispatch } from "react";
import type { ProjectAction } from "../editor/state/projectStore";
import type { SourceImageFileAdapter } from "../platform/appPlatform";
import { runWithVisibleAsyncCommand } from "./visibleErrors";

const SUPPORTED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const SUPPORTED_IMAGE_LABEL = "PNG, JPG, or WEBP";

export type ImportFilesHandler = (files: readonly File[]) => Promise<void>;

export function createImportFilesHandler(
  dispatch: Dispatch<ProjectAction>,
  setErrorMessage: (message: string | null) => void,
  sourceImageFiles: SourceImageFileAdapter,
): ImportFilesHandler {
  return async (files) => {
    await runWithVisibleAsyncCommand(async () => {
      const imageFiles = validateImageFiles(files);
      for (const file of imageFiles) {
        const imported = await sourceImageFiles.readImageFile(file);
        dispatch({ type: "sourceImageImported", imported });
      }
    }, setErrorMessage);
  };
}

export function createFileInputImportHandler(
  importFiles: ImportFilesHandler,
): (event: ChangeEvent<HTMLInputElement>) => Promise<void> {
  return async (event) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    await importFiles(files);
  };
}

function validateImageFiles(files: readonly File[]): readonly File[] {
  if (files.length === 0) {
    return [];
  }
  const unsupportedFile = files.find((file) => !isSupportedImageFile(file));
  if (unsupportedFile) {
    throw new Error(
      `Only ${SUPPORTED_IMAGE_LABEL} Source Images can be imported: ${unsupportedFile.name}`,
    );
  }
  return files;
}

function isSupportedImageFile(file: File): boolean {
  return SUPPORTED_IMAGE_TYPES.has(file.type);
}
