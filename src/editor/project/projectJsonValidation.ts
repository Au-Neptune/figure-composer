import type { ExportPreset, ExportFormat } from "../model/exportPreset";
import type {
  CanvasSettings,
  FigureObject,
  InsetObject,
  SourceImageObject,
} from "../model/figure";
import type { Rect } from "../model/geometry";
import type { RegionOfInterest, RoiFrameStyle } from "../model/roi";
import {
  MAX_JPG_QUALITY,
  MIN_EXPORT_DIMENSION,
  MIN_EXPORT_DPI,
  MIN_JPG_QUALITY,
} from "../state/editorDefaults";
import {
  PROJECT_FORMAT_NAME,
  PROJECT_FORMAT_VERSION,
  type ProjectJson,
  type SerializedFigure,
  type SerializedSourceImage,
} from "./projectJson";

export function parseProjectJsonText(text: string): ProjectJson {
  const parsed = JSON.parse(text) as unknown;
  return parseProjectJson(parsed);
}

function parseProjectJson(value: unknown): ProjectJson {
  const record = readRecord(value, "Project JSON");
  const format = readString(record.format, "Project format");
  const version = readNumber(record.version, "Project version");
  if (format !== PROJECT_FORMAT_NAME || version !== PROJECT_FORMAT_VERSION) {
    throw new Error(`Unsupported Project format: ${format} v${version}`);
  }
  return {
    format: PROJECT_FORMAT_NAME,
    version: PROJECT_FORMAT_VERSION,
    figure: parseFigure(record.figure),
  };
}

function parseFigure(value: unknown): SerializedFigure {
  const record = readRecord(value, "Figure");
  return {
    id: readString(record.id, "Figure id"),
    canvas: parseCanvas(record.canvas),
    sourceImages: readArray(record.sourceImages, "Source Images").map(
      parseSourceImage,
    ),
    objects: readArray(record.objects, "Figure objects").map(parseFigureObject),
    rois: readArray(record.rois, "Regions Of Interest").map(parseRoi),
    exportPresets: readNonEmptyArray(record.exportPresets, "Export Presets").map(
      parseExportPreset,
    ),
  };
}

function parseSourceImage(value: unknown): SerializedSourceImage {
  const record = readRecord(value, "Source Image");
  return {
    id: readString(record.id, "Source Image id"),
    name: readString(record.name, "Source Image name"),
    assetFileName: readString(record.assetFileName, "Source Image asset"),
    width: readNumber(record.width, "Source Image width"),
    height: readNumber(record.height, "Source Image height"),
    referencedBy: readArray(record.referencedBy, "Source Image references").map(
      (item) => readString(item, "Source Image reference"),
    ),
  };
}

function parseFigureObject(value: unknown): FigureObject {
  const record = readRecord(value, "Figure object");
  const kind = readString(record.kind, "Figure object kind");
  if (kind === "sourceImage") {
    return parseSourceImageObject(record);
  }
  if (kind === "inset") {
    return parseInsetObject(record);
  }
  throw new Error(`Unsupported Figure object kind: ${kind}`);
}

function parseSourceImageObject(
  record: Record<string, unknown>,
): SourceImageObject {
  return {
    ...parseObjectBounds(record),
    kind: "sourceImage",
    sourceImageId: readString(record.sourceImageId, "Source Image object id"),
  };
}

function parseInsetObject(record: Record<string, unknown>): InsetObject {
  return {
    ...parseObjectBounds(record),
    kind: "inset",
    sourceImageId: readString(record.sourceImageId, "Inset source id"),
    roiId: readString(record.roiId, "Inset ROI id"),
  };
}

function parseObjectBounds(record: Record<string, unknown>): Rect & { id: string } {
  return {
    id: readString(record.id, "Figure object id"),
    x: readNumber(record.x, "Figure object x"),
    y: readNumber(record.y, "Figure object y"),
    width: readNumber(record.width, "Figure object width"),
    height: readNumber(record.height, "Figure object height"),
  };
}

function parseRoi(value: unknown): RegionOfInterest {
  const record = readRecord(value, "Region Of Interest");
  return {
    id: readString(record.id, "ROI id"),
    sourceImageId: readString(record.sourceImageId, "ROI source id"),
    sourceObjectId: readString(record.sourceObjectId, "ROI object id"),
    rect: parseRect(record.rect, "ROI rect"),
    frame: parseRoiFrame(record.frame),
  };
}

function parseRoiFrame(value: unknown): RoiFrameStyle {
  const record = readRecord(value, "ROI frame");
  return {
    visible: readBoolean(record.visible, "ROI frame visibility"),
    stroke: readString(record.stroke, "ROI frame stroke"),
    strokeWidth: readNumber(record.strokeWidth, "ROI frame stroke width"),
  };
}

function parseExportPreset(value: unknown): ExportPreset {
  const record = readRecord(value, "Export Preset");
  return {
    id: readString(record.id, "Export Preset id"),
    name: readString(record.name, "Export Preset name"),
    width: readMinNumber(record.width, "Export Preset width", MIN_EXPORT_DIMENSION),
    height: readMinNumber(
      record.height,
      "Export Preset height",
      MIN_EXPORT_DIMENSION,
    ),
    dpi: readMinNumber(record.dpi, "Export Preset DPI", MIN_EXPORT_DPI),
    format: parseExportFormat(record.format),
    background: readString(record.background, "Export Preset background"),
    jpgQuality: readJpgQuality(record.jpgQuality),
  };
}

function parseCanvas(value: unknown): CanvasSettings {
  const record = readRecord(value, "Canvas settings");
  return {
    width: readNumber(record.width, "Canvas width"),
    height: readNumber(record.height, "Canvas height"),
    background: readString(record.background, "Canvas background"),
  };
}

function parseRect(value: unknown, label: string): Rect {
  const record = readRecord(value, label);
  return {
    x: readNumber(record.x, `${label} x`),
    y: readNumber(record.y, `${label} y`),
    width: readNumber(record.width, `${label} width`),
    height: readNumber(record.height, `${label} height`),
  };
}

function parseExportFormat(value: unknown): ExportFormat {
  const format = readString(value, "Export format");
  if (format === "png" || format === "jpg") {
    return format;
  }
  throw new Error(`Unsupported export format: ${format}`);
}

function readRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function readArray(value: unknown, label: string): readonly unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }
  return value;
}

function readNonEmptyArray(value: unknown, label: string): readonly unknown[] {
  const items = readArray(value, label);
  if (items.length === 0) {
    throw new Error(`${label} must contain at least one item.`);
  }
  return items;
}

function readString(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new Error(`${label} must be a string.`);
  }
  return value;
}

function readNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number.`);
  }
  return value;
}

function readMinNumber(value: unknown, label: string, min: number): number {
  const number = readNumber(value, label);
  if (number < min) {
    throw new Error(`${label} must be at least ${min}.`);
  }
  return number;
}

function readJpgQuality(value: unknown): number {
  const quality = readNumber(value, "Export Preset JPG quality");
  if (quality < MIN_JPG_QUALITY || quality > MAX_JPG_QUALITY) {
    throw new Error(
      `Export Preset JPG quality must be between ${MIN_JPG_QUALITY} and ${MAX_JPG_QUALITY}.`,
    );
  }
  return quality;
}

function readBoolean(value: unknown, label: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`${label} must be a boolean.`);
  }
  return value;
}
