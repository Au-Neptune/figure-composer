import type { Figure } from "../../editor/model/figure";
import {
  PROJECT_ASSETS_DIR_NAME,
  PROJECT_JSON_FILE_NAME,
  createProjectJson,
  hydrateFigure,
} from "../../editor/project/projectJson";
import { parseProjectJsonText } from "../../editor/project/projectJsonValidation";

const JSON_MIME_TYPE = "application/json";
const JSON_INDENT_SPACES = 2;
const READ_ONLY_MODE = "read";
const READ_WRITE_MODE = "readwrite";

interface DirectoryPickerOptions {
  readonly mode: typeof READ_ONLY_MODE | typeof READ_WRITE_MODE;
}

type FileSystemAccessWindow = Window & {
  readonly showDirectoryPicker?: (
    options?: DirectoryPickerOptions,
  ) => Promise<FileSystemDirectoryHandle>;
};

export async function saveProjectFolder(figure: Figure): Promise<void> {
  const root = await pickProjectDirectory(READ_WRITE_MODE);
  const assets = await root.getDirectoryHandle(PROJECT_ASSETS_DIR_NAME, {
    create: true,
  });
  await writeSourceAssets(assets, figure);
  await writeProjectJson(root, figure);
}

export async function openProjectFolder(): Promise<Figure> {
  const root = await pickProjectDirectory(READ_ONLY_MODE);
  const projectJson = parseProjectJsonText(await readProjectJson(root));
  const assetUrls = await readAssetUrls(root, projectJson.figure.sourceImages);
  return hydrateFigure(projectJson, assetUrls);
}

async function pickProjectDirectory(
  mode: DirectoryPickerOptions["mode"],
): Promise<FileSystemDirectoryHandle> {
  const picker = (window as FileSystemAccessWindow).showDirectoryPicker;
  if (!picker) {
    throw new Error("Project folders require the File System Access API.");
  }
  return picker({ mode });
}

async function writeSourceAssets(
  assets: FileSystemDirectoryHandle,
  figure: Figure,
): Promise<void> {
  for (const sourceImage of figure.sourceImages) {
    const blob = await readAssetBlob(sourceImage.assetUrl);
    await writeFile(assets, sourceImage.assetFileName, blob);
  }
}

async function writeProjectJson(
  root: FileSystemDirectoryHandle,
  figure: Figure,
): Promise<void> {
  const text = JSON.stringify(createProjectJson(figure), null, JSON_INDENT_SPACES);
  const blob = new Blob([text], { type: JSON_MIME_TYPE });
  await writeFile(root, PROJECT_JSON_FILE_NAME, blob);
}

async function readProjectJson(root: FileSystemDirectoryHandle): Promise<string> {
  const handle = await root.getFileHandle(PROJECT_JSON_FILE_NAME);
  const file = await handle.getFile();
  return file.text();
}

async function readAssetUrls(
  root: FileSystemDirectoryHandle,
  sourceImages: readonly { readonly assetFileName: string }[],
): Promise<ReadonlyMap<string, string>> {
  const assets = await root.getDirectoryHandle(PROJECT_ASSETS_DIR_NAME);
  const entries = await Promise.all(
    sourceImages.map((sourceImage) => readAssetUrl(assets, sourceImage.assetFileName)),
  );
  return new Map(entries);
}

async function readAssetUrl(
  assets: FileSystemDirectoryHandle,
  assetFileName: string,
): Promise<readonly [string, string]> {
  const handle = await assets.getFileHandle(assetFileName);
  const file = await handle.getFile();
  return [assetFileName, URL.createObjectURL(file)];
}

async function readAssetBlob(assetUrl: string): Promise<Blob> {
  const response = await fetch(assetUrl);
  if (!response.ok) {
    throw new Error(`Failed to read Source Image asset: ${assetUrl}`);
  }
  return response.blob();
}

async function writeFile(
  directory: FileSystemDirectoryHandle,
  fileName: string,
  blob: Blob,
): Promise<void> {
  const handle = await directory.getFileHandle(fileName, { create: true });
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
}

