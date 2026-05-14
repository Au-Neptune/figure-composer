const DEFAULT_ASSET_EXTENSION = ".bin";
const MAX_ASSET_BASENAME_LENGTH = 80;
const UNSAFE_ASSET_NAME_CHARS = /[^a-zA-Z0-9._-]/g;

export function createAssetFileName(
  sourceImageId: string,
  originalName: string,
): string {
  const extension = getFileExtension(originalName);
  const basename = sanitizeAssetBasename(removeFileExtension(originalName));
  return `${sourceImageId}_${basename}${extension}`;
}

function getFileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex < 0 || dotIndex === fileName.length - 1) {
    return DEFAULT_ASSET_EXTENSION;
  }
  return fileName.slice(dotIndex).toLowerCase();
}

function removeFileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
}

function sanitizeAssetBasename(fileName: string): string {
  const sanitized = fileName
    .replace(UNSAFE_ASSET_NAME_CHARS, "_")
    .replace(/_+/g, "_")
    .slice(0, MAX_ASSET_BASENAME_LENGTH);
  return sanitized || "source-image";
}

