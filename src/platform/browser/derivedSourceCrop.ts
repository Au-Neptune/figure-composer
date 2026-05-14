import type { RegionOfInterest } from "../../editor/model/roi";
import type {
  DerivedSourceImageInput,
  SourceImage,
} from "../../editor/model/sourceImage";

const CROP_IMAGE_MIME_TYPE = "image/png";
const CROP_IMAGE_EXTENSION = ".png";
const CROP_NAME_SUFFIX = " crop";
const MIN_CROP_SIDE_PX = 1;
const CANVAS_ORIGIN = 0;

interface CreateDerivedSourceCropOptions {
  readonly sourceImage: SourceImage;
  readonly roi: RegionOfInterest;
}

export async function createDerivedSourceCrop({
  sourceImage,
  roi,
}: CreateDerivedSourceCropOptions): Promise<DerivedSourceImageInput> {
  assertRoiBelongsToSourceImage(sourceImage, roi);
  const image = await loadSourceImageElement(sourceImage.assetUrl);
  const canvas = createCropCanvas(roi);
  const context = readCanvasContext(canvas);
  context.drawImage(
    image,
    roi.rect.x,
    roi.rect.y,
    roi.rect.width,
    roi.rect.height,
    CANVAS_ORIGIN,
    CANVAS_ORIGIN,
    canvas.width,
    canvas.height,
  );
  const blob = await createCropBlob(canvas);
  return {
    name: createDerivedCropName(sourceImage.name),
    assetUrl: URL.createObjectURL(blob),
    width: canvas.width,
    height: canvas.height,
    lineage: {
      kind: "derived",
      parentSourceImageId: sourceImage.id,
      roiId: roi.id,
      cropRect: roi.rect,
    },
  };
}

function assertRoiBelongsToSourceImage(
  sourceImage: SourceImage,
  roi: RegionOfInterest,
): void {
  if (roi.sourceImageId !== sourceImage.id) {
    throw new Error(`ROI ${roi.id} does not belong to Source Image ${sourceImage.id}.`);
  }
}

function loadSourceImageElement(assetUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error(`Failed to load Source Image for crop: ${assetUrl}`));
    image.src = assetUrl;
  });
}

function createCropCanvas(roi: RegionOfInterest): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = readCropSide(roi.rect.width, "width");
  canvas.height = readCropSide(roi.rect.height, "height");
  return canvas;
}

function readCropSide(value: number, label: string): number {
  if (!Number.isFinite(value) || value < MIN_CROP_SIDE_PX) {
    throw new Error(`Derived crop ${label} must be at least ${MIN_CROP_SIDE_PX}.`);
  }
  return Math.round(value);
}

function readCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context is required to crop a Source Image.");
  }
  return context;
}

function createCropBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create Derived Source Image blob."));
        return;
      }
      resolve(blob);
    }, CROP_IMAGE_MIME_TYPE);
  });
}

function createDerivedCropName(sourceImageName: string): string {
  return `${removeFileExtension(sourceImageName)}${CROP_NAME_SUFFIX}${CROP_IMAGE_EXTENSION}`;
}

function removeFileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
}
