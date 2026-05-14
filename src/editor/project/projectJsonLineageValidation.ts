import type { Rect, Size } from "../model/geometry";
import type {
  DerivedSourceImageOperation,
  SourceImageLineage,
} from "../model/sourceImage";

export function parseSourceImageLineage(value: unknown): SourceImageLineage {
  if (value === undefined) {
    return { kind: "imported" };
  }
  const record = readRecord(value, "Source Image lineage");
  const kind = readString(record.kind, "Source Image lineage kind");
  if (kind === "imported") {
    return { kind: "imported" };
  }
  if (kind === "derived") {
    return parseDerivedSourceImageLineage(record);
  }
  throw new Error(`Unsupported Source Image lineage kind: ${kind}`);
}

function parseDerivedSourceImageLineage(
  record: Record<string, unknown>,
): SourceImageLineage {
  const operation = parseDerivedOperation(record);
  return {
    kind: "derived",
    parentSourceImageId: readString(
      record.parentSourceImageId,
      "Derived Source Image parent id",
    ),
    operation,
    ...createLegacyCropFields(operation),
  };
}

function parseDerivedOperation(
  record: Record<string, unknown>,
): DerivedSourceImageOperation {
  if (record.operation === undefined) {
    return {
      kind: "crop",
      roiId: readString(record.roiId, "Derived Source Image ROI id"),
      cropRect: parseRect(record.cropRect, "Derived Source Image crop rect"),
    };
  }
  return parseDerivedOperationRecord(
    readRecord(record.operation, "Derived Source Image operation"),
  );
}

function parseDerivedOperationRecord(
  record: Record<string, unknown>,
): DerivedSourceImageOperation {
  const kind = readString(record.kind, "Derived Source Image operation kind");
  if (kind === "crop") {
    return parseCropOperation(record);
  }
  if (kind === "resize") {
    return parseResizeOperation(record);
  }
  if (kind === "rotate") {
    return parseRotateOperation(record);
  }
  throw new Error(`Unsupported Derived Source Image operation: ${kind}`);
}

function parseCropOperation(
  record: Record<string, unknown>,
): DerivedSourceImageOperation {
  return {
    kind: "crop",
    roiId: readString(record.roiId, "Derived Source Image ROI id"),
    cropRect: parseRect(record.cropRect, "Derived Source Image crop rect"),
  };
}

function parseResizeOperation(
  record: Record<string, unknown>,
): DerivedSourceImageOperation {
  return {
    kind: "resize",
    sourceSize: parseSize(record.sourceSize, "Resize source size"),
    outputSize: parseSize(record.outputSize, "Resize output size"),
  };
}

function parseRotateOperation(
  record: Record<string, unknown>,
): DerivedSourceImageOperation {
  return {
    kind: "rotate",
    degrees: parseRotationDegrees(record.degrees),
    sourceSize: parseSize(record.sourceSize, "Rotate source size"),
  };
}

function createLegacyCropFields(operation: DerivedSourceImageOperation) {
  return operation.kind === "crop"
    ? { roiId: operation.roiId, cropRect: operation.cropRect }
    : {};
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

function parseSize(value: unknown, label: string): Size {
  const record = readRecord(value, label);
  return {
    width: readNumber(record.width, `${label} width`),
    height: readNumber(record.height, `${label} height`),
  };
}

function parseRotationDegrees(value: unknown): 90 | 180 | 270 {
  const degrees = readNumber(value, "Rotate degrees");
  if (degrees === 90 || degrees === 180 || degrees === 270) {
    return degrees;
  }
  throw new Error(`Unsupported rotate degrees: ${degrees}`);
}

function readRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
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
