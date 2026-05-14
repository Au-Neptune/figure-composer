import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import type { Figure } from "../../editor/model/figure";
import { getAssetMimeType } from "../../editor/project/assetMimeTypes";
import { createProjectJson, hydrateFigure } from "../../editor/project/projectJson";
import { parseProjectJsonText } from "../../editor/project/projectJsonValidation";
import type { ProjectFolderAdapter } from "../appPlatform";

const JSON_INDENT_SPACES = 2;
const OPEN_PROJECT_DIALOG_TITLE = "Open Figure Composer Project";
const SAVE_PROJECT_DIALOG_TITLE = "Save Figure Composer Project";

interface TauriProjectAsset {
  readonly fileName: string;
  readonly bytes: readonly number[] | Uint8Array;
}

interface SaveProjectFolderRequest {
  readonly rootPath: string;
  readonly projectJsonText: string;
  readonly assets: readonly TauriProjectAsset[];
}

interface OpenProjectFolderResponse {
  readonly projectJsonText: string;
  readonly assets: readonly TauriProjectAsset[];
}

export const tauriProjectFolderAdapter: ProjectFolderAdapter = {
  saveProjectFolder,
  openProjectFolder,
};

async function saveProjectFolder(figure: Figure): Promise<void> {
  const rootPath = await pickProjectDirectory(SAVE_PROJECT_DIALOG_TITLE);
  await invoke("save_project_folder", {
    request: await createSaveProjectFolderRequest(rootPath, figure),
  });
}

async function openProjectFolder(): Promise<Figure> {
  const rootPath = await pickProjectDirectory(OPEN_PROJECT_DIALOG_TITLE);
  const response = await invoke<OpenProjectFolderResponse>("open_project_folder", {
    rootPath,
  });
  const projectJson = parseProjectJsonText(response.projectJsonText);
  return hydrateFigure(projectJson, createAssetUrls(response.assets));
}

async function createSaveProjectFolderRequest(
  rootPath: string,
  figure: Figure,
): Promise<SaveProjectFolderRequest> {
  return {
    rootPath,
    projectJsonText: JSON.stringify(createProjectJson(figure), null, JSON_INDENT_SPACES),
    assets: await readSourceAssets(figure),
  };
}

async function pickProjectDirectory(title: string): Promise<string> {
  const selectedPath = await open({ directory: true, multiple: false, title });
  if (!selectedPath) {
    throw new Error("Project folder selection was cancelled.");
  }
  if (Array.isArray(selectedPath)) {
    throw new Error("Project folder selection returned multiple paths.");
  }
  return selectedPath;
}

async function readSourceAssets(figure: Figure): Promise<readonly TauriProjectAsset[]> {
  return Promise.all(
    figure.sourceImages.map(async (sourceImage) => ({
      fileName: sourceImage.assetFileName,
      bytes: await readAssetBytes(sourceImage.assetUrl),
    })),
  );
}

async function readAssetBytes(assetUrl: string): Promise<readonly number[]> {
  const response = await fetch(assetUrl);
  if (!response.ok) {
    throw new Error(`Failed to read Source Image asset: ${assetUrl}`);
  }
  return Array.from(new Uint8Array(await response.arrayBuffer()));
}

function createAssetUrls(
  assets: readonly TauriProjectAsset[],
): ReadonlyMap<string, string> {
  return new Map(
    assets.map((asset) => {
      const bytes = normalizeAssetBytes(asset.bytes);
      const blob = new Blob([copyAssetBuffer(bytes)], {
        type: getAssetMimeType(asset.fileName),
      });
      return [asset.fileName, URL.createObjectURL(blob)];
    }),
  );
}

function normalizeAssetBytes(bytes: readonly number[] | Uint8Array): Uint8Array {
  return bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
}

function copyAssetBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}
