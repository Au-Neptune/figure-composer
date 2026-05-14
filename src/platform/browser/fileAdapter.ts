import type { ImportedSourceImage } from "../../editor/model/sourceImage";

export async function readImageFile(file: File): Promise<ImportedSourceImage> {
  const assetUrl = URL.createObjectURL(file);
  try {
    const size = await loadNaturalImageSize(assetUrl);
    return {
      name: file.name,
      assetUrl,
      width: size.width,
      height: size.height,
    };
  } catch (error) {
    URL.revokeObjectURL(assetUrl);
    throw error;
  }
}

function loadNaturalImageSize(
  assetUrl: string,
): Promise<{ readonly width: number; readonly height: number }> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () =>
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    image.onerror = () =>
      reject(new Error(`Failed to read Source Image dimensions: ${assetUrl}`));
    image.src = assetUrl;
  });
}

