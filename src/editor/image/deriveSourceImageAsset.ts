import type { Rect, Size } from "../model/geometry";
import type { ImportedSourceImage, SourceImage } from "../model/sourceImage";

const DERIVED_IMAGE_TYPE = "image/png";
const RIGHT_ANGLE_DEGREES = 90;

export async function createCroppedSourceImageAsset(
  sourceImage: SourceImage,
  cropRect: Rect,
): Promise<ImportedSourceImage> {
  const canvas = createCanvas(Math.round(cropRect.width), Math.round(cropRect.height));
  const context = getCanvasContext(canvas);
  const image = await loadImage(sourceImage.assetUrl);
  context.drawImage(
    image,
    cropRect.x,
    cropRect.y,
    cropRect.width,
    cropRect.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return createImportedSourceImage(`${sourceImage.name} crop.png`, canvas);
}

export async function createResizedSourceImageAsset(
  sourceImage: SourceImage,
  outputSize: Size,
): Promise<ImportedSourceImage> {
  const canvas = createCanvas(outputSize.width, outputSize.height);
  const context = getCanvasContext(canvas);
  context.drawImage(await loadImage(sourceImage.assetUrl), 0, 0, canvas.width, canvas.height);
  return createImportedSourceImage(`${sourceImage.name} resize.png`, canvas);
}

export async function createRotatedSourceImageAsset(
  sourceImage: SourceImage,
  degrees: 90 | 180 | 270,
): Promise<ImportedSourceImage> {
  const rotatedSize = createRotatedSize(sourceImage, degrees);
  const canvas = createCanvas(rotatedSize.width, rotatedSize.height);
  const context = getCanvasContext(canvas);
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((degrees * Math.PI) / 180);
  context.drawImage(
    await loadImage(sourceImage.assetUrl),
    -sourceImage.width / 2,
    -sourceImage.height / 2,
  );
  return createImportedSourceImage(`${sourceImage.name} rotate-${degrees}.png`, canvas);
}

function createRotatedSize(size: Size, degrees: 90 | 180 | 270): Size {
  return degrees === RIGHT_ANGLE_DEGREES || degrees === 270
    ? { width: size.height, height: size.width }
    : size;
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  if (width <= 0 || height <= 0) {
    throw new Error("Derived Source Image dimensions must be positive.");
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context is required for Source Image operations.");
  }
  return context;
}

function loadImage(assetUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error(`Failed to load Source Image asset: ${assetUrl}`));
    image.src = assetUrl;
  });
}

async function createImportedSourceImage(
  name: string,
  canvas: HTMLCanvasElement,
): Promise<ImportedSourceImage> {
  const blob = await createCanvasBlob(canvas);
  return {
    name,
    assetUrl: URL.createObjectURL(blob),
    width: canvas.width,
    height: canvas.height,
  };
}

function createCanvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to encode Derived Source Image asset."));
        return;
      }
      resolve(blob);
    }, DERIVED_IMAGE_TYPE);
  });
}
