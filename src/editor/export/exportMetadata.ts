import type { ExportPreset } from "../model/exportPreset";

const BASE64_MARKER = ";base64,";
const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10] as const;
const JPEG_MARKER_PREFIX = 0xff;
const JPEG_SOI_MARKER = 0xd8;
const JPEG_SOI = [JPEG_MARKER_PREFIX, JPEG_SOI_MARKER] as const;
const JPEG_APP0 = 0xe0;
const JPEG_JFIF_LENGTH = 16;
const JPEG_APP0_OFFSET = JPEG_SOI.length;
const JPEG_APP0_TYPE_OFFSET = JPEG_APP0_OFFSET + 1;
const JPEG_JFIF_IDENTIFIER = "JFIF\0";
const JPEG_JFIF_IDENTIFIER_OFFSET = JPEG_APP0_OFFSET + 4;
const JPEG_JFIF_VERSION_MAJOR_OFFSET =
  JPEG_JFIF_IDENTIFIER_OFFSET + JPEG_JFIF_IDENTIFIER.length;
const JPEG_JFIF_VERSION_MINOR_OFFSET = JPEG_JFIF_VERSION_MAJOR_OFFSET + 1;
const JPEG_JFIF_DENSITY_UNIT_OFFSET = JPEG_JFIF_VERSION_MINOR_OFFSET + 1;
const JPEG_JFIF_X_DENSITY_OFFSET = JPEG_JFIF_DENSITY_UNIT_OFFSET + 1;
const JPEG_JFIF_Y_DENSITY_OFFSET = JPEG_JFIF_X_DENSITY_OFFSET + 2;
const JPEG_DENSITY_UNIT_DPI = 1;
const JPEG_JFIF_MAJOR_VERSION = 1;
const JPEG_JFIF_MINOR_VERSION = 2;
const JPEG_EMPTY_THUMBNAIL_SIZE = 0;
const PNG_PHYSICAL_PIXEL_UNIT_METER = 1;
const PNG_PIXELS_PER_METER_PER_DPI = 39.37007874015748;
const UINT16_MAX = 0xffff;
const UINT32_MAX = 0xffffffff;

export function applyExportDpiMetadata(
  dataUrl: string,
  preset: ExportPreset,
): string {
  const parsed = parseDataUrl(dataUrl);
  const bytes =
    preset.format === "png"
      ? writePngDpi(parsed.bytes, preset.dpi)
      : writeJpegDpi(parsed.bytes, preset.dpi);
  return createDataUrl(parsed.mimeType, bytes);
}

function writePngDpi(bytes: Uint8Array, dpi: number): Uint8Array {
  assertPng(bytes);
  const ppu = Math.round(dpi * PNG_PIXELS_PER_METER_PER_DPI);
  const chunk = createPngChunk("pHYs", [
    ...uint32Bytes(ppu),
    ...uint32Bytes(ppu),
    PNG_PHYSICAL_PIXEL_UNIT_METER,
  ]);
  return insertAfterIhdr(removePngChunks(bytes, "pHYs"), chunk);
}

function writeJpegDpi(bytes: Uint8Array, dpi: number): Uint8Array {
  assertJpeg(bytes);
  if (dpi > UINT16_MAX) {
    throw new Error("JPEG DPI metadata cannot exceed 65535.");
  }
  const density = Math.round(dpi);
  if (hasJfifApp0(bytes)) {
    const copy = new Uint8Array(bytes);
    copy[JPEG_JFIF_DENSITY_UNIT_OFFSET] = JPEG_DENSITY_UNIT_DPI;
    writeUint16(copy, JPEG_JFIF_X_DENSITY_OFFSET, density);
    writeUint16(copy, JPEG_JFIF_Y_DENSITY_OFFSET, density);
    return copy;
  }
  return insertBytes(bytes, JPEG_APP0_OFFSET, createJfifApp0(density));
}

function parseDataUrl(dataUrl: string): {
  readonly mimeType: string;
  readonly bytes: Uint8Array;
} {
  const markerIndex = dataUrl.indexOf(BASE64_MARKER);
  if (!dataUrl.startsWith("data:") || markerIndex < 0) {
    throw new Error("Export data URL must be base64 encoded.");
  }
  return {
    mimeType: dataUrl.slice("data:".length, markerIndex),
    bytes: base64ToBytes(dataUrl.slice(markerIndex + BASE64_MARKER.length)),
  };
}

function createDataUrl(mimeType: string, bytes: Uint8Array): string {
  return `data:${mimeType}${BASE64_MARKER}${bytesToBase64(bytes)}`;
}

function removePngChunks(bytes: Uint8Array, type: string): Uint8Array {
  const chunks: Uint8Array[] = [new Uint8Array(PNG_SIGNATURE)];
  let offset: number = PNG_SIGNATURE.length;
  while (offset < bytes.length) {
    const length = readUint32(bytes, offset);
    const end = offset + 12 + length;
    const chunkType = readAscii(bytes, offset + 4, 4);
    if (chunkType !== type) {
      chunks.push(bytes.slice(offset, end));
    }
    offset = end;
  }
  return concatBytes(chunks);
}

function insertAfterIhdr(bytes: Uint8Array, chunk: Uint8Array): Uint8Array {
  const ihdrEnd = PNG_SIGNATURE.length + 12 + readUint32(bytes, PNG_SIGNATURE.length);
  return insertBytes(bytes, ihdrEnd, chunk);
}

function createPngChunk(type: string, data: readonly number[]): Uint8Array {
  const typeBytes = asciiBytes(type);
  const body = new Uint8Array([...typeBytes, ...data]);
  return new Uint8Array([
    ...uint32Bytes(data.length),
    ...body,
    ...uint32Bytes(crc32(body)),
  ]);
}

function createJfifApp0(dpi: number): Uint8Array {
  return new Uint8Array([
    JPEG_MARKER_PREFIX,
    JPEG_APP0,
    ...uint16Bytes(JPEG_JFIF_LENGTH),
    ...asciiBytes(JPEG_JFIF_IDENTIFIER),
    JPEG_JFIF_MAJOR_VERSION,
    JPEG_JFIF_MINOR_VERSION,
    JPEG_DENSITY_UNIT_DPI,
    ...uint16Bytes(dpi),
    ...uint16Bytes(dpi),
    JPEG_EMPTY_THUMBNAIL_SIZE,
    JPEG_EMPTY_THUMBNAIL_SIZE,
  ]);
}

function hasJfifApp0(bytes: Uint8Array): boolean {
  return (
    bytes[JPEG_APP0_OFFSET] === JPEG_MARKER_PREFIX &&
    bytes[JPEG_APP0_TYPE_OFFSET] === JPEG_APP0 &&
    readAscii(
      bytes,
      JPEG_JFIF_IDENTIFIER_OFFSET,
      JPEG_JFIF_IDENTIFIER.length,
    ) === JPEG_JFIF_IDENTIFIER
  );
}

function assertPng(bytes: Uint8Array): void {
  if (!PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)) {
    throw new Error("PNG export metadata requires PNG data.");
  }
}

function assertJpeg(bytes: Uint8Array): void {
  if (bytes[0] !== JPEG_SOI[0] || bytes[1] !== JPEG_SOI[1]) {
    throw new Error("JPEG export metadata requires JPEG data.");
  }
}

function insertBytes(bytes: Uint8Array, offset: number, inserted: Uint8Array): Uint8Array {
  return concatBytes([bytes.slice(0, offset), inserted, bytes.slice(offset)]);
}

function readAscii(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}

function asciiBytes(text: string): readonly number[] {
  return [...text].map((char) => char.charCodeAt(0));
}

function readUint32(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] ?? 0) * 0x1000000 +
      ((bytes[offset + 1] ?? 0) << 16) +
      ((bytes[offset + 2] ?? 0) << 8) +
      (bytes[offset + 3] ?? 0)) >>>
    0
  );
}

function writeUint16(bytes: Uint8Array, offset: number, value: number): void {
  bytes[offset] = (value >> 8) & 0xff;
  bytes[offset + 1] = value & 0xff;
}

function uint16Bytes(value: number): readonly number[] {
  return [(value >> 8) & 0xff, value & 0xff];
}

function uint32Bytes(value: number): readonly number[] {
  return [
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ];
}

function crc32(bytes: Uint8Array): number {
  let crc = UINT32_MAX;
  for (const byte of bytes) {
    crc = updateCrc32(crc, byte);
  }
  return (crc ^ UINT32_MAX) >>> 0;
}

function updateCrc32(crc: number, byte: number): number {
  let next = (crc ^ byte) >>> 0;
  for (let bit = 0; bit < 8; bit += 1) {
    next = next & 1 ? (0xedb88320 ^ (next >>> 1)) >>> 0 : next >>> 1;
  }
  return next;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  const chunkSize = 0x8000;
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(offset, offset + chunkSize));
  }
  return btoa(binary);
}

function concatBytes(chunks: readonly Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}
