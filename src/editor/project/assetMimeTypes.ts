const DEFAULT_ASSET_MIME_TYPE = "application/octet-stream";

const ASSET_MIME_TYPES = new Map<string, string>([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

export function getAssetMimeType(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex < 0) {
    return DEFAULT_ASSET_MIME_TYPE;
  }
  const extension = fileName.slice(dotIndex).toLowerCase();
  return ASSET_MIME_TYPES.get(extension) ?? DEFAULT_ASSET_MIME_TYPE;
}
