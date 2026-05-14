import { describe, expect, it } from "vitest";
import type { ExportPreset } from "../model/exportPreset";
import { applyExportDpiMetadata } from "./exportMetadata";

const PNG_PRESET: ExportPreset = {
  id: "preset_png",
  name: "PNG",
  width: 100,
  height: 100,
  dpi: 300,
  format: "png",
  background: "#ffffff",
  jpgQuality: 0.92,
};

const JPG_PRESET: ExportPreset = {
  ...PNG_PRESET,
  id: "preset_jpg",
  name: "JPG",
  format: "jpg",
};

describe("applyExportDpiMetadata", () => {
  it("writes PNG pHYs density metadata", () => {
    const output = applyExportDpiMetadata(
      createDataUrl("image/png", createMinimalPng()),
      PNG_PRESET,
    );
    const bytes = readDataUrlBytes(output);
    const pHysOffset = findAscii(bytes, "pHYs");

    expect(pHysOffset).toBeGreaterThan(0);
    expect(readUint32(bytes, pHysOffset + 4)).toBe(11811);
    expect(readUint32(bytes, pHysOffset + 8)).toBe(11811);
    expect(bytes[pHysOffset + 12]).toBe(1);
  });

  it("writes JPEG JFIF density metadata", () => {
    const output = applyExportDpiMetadata(
      createDataUrl("image/jpeg", createMinimalJpeg()),
      JPG_PRESET,
    );
    const bytes = readDataUrlBytes(output);

    expect(readAscii(bytes, 6, 5)).toBe("JFIF\0");
    expect(bytes[13]).toBe(1);
    expect(readUint16(bytes, 14)).toBe(300);
    expect(readUint16(bytes, 16)).toBe(300);
  });

  it("updates existing JPEG JFIF density metadata", () => {
    const output = applyExportDpiMetadata(
      createDataUrl("image/jpeg", createJfifJpeg(72)),
      JPG_PRESET,
    );
    const bytes = readDataUrlBytes(output);

    expect(bytes[11]).toBe(1);
    expect(bytes[12]).toBe(2);
    expect(bytes[13]).toBe(1);
    expect(readUint16(bytes, 14)).toBe(300);
    expect(readUint16(bytes, 16)).toBe(300);
  });
});

function createMinimalPng(): Uint8Array {
  return new Uint8Array([
    137, 80, 78, 71, 13, 10, 26, 10,
    0, 0, 0, 13, 73, 72, 68, 82,
    0, 0, 0, 1, 0, 0, 0, 1,
    8, 6, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 73, 69, 78, 68,
    0, 0, 0, 0,
  ]);
}

function createMinimalJpeg(): Uint8Array {
  return new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
}

function createJfifJpeg(dpi: number): Uint8Array {
  return new Uint8Array([
    0xff, 0xd8,
    0xff, 0xe0,
    ...uint16Bytes(16),
    0x4a, 0x46, 0x49, 0x46, 0,
    1, 2, 0,
    ...uint16Bytes(dpi),
    ...uint16Bytes(dpi),
    0, 0,
    0xff, 0xd9,
  ]);
}

function createDataUrl(mimeType: string, bytes: Uint8Array): string {
  return `data:${mimeType};base64,${bytesToBase64(bytes)}`;
}

function readDataUrlBytes(dataUrl: string): Uint8Array {
  return base64ToBytes(dataUrl.slice(dataUrl.indexOf(",") + 1));
}

function findAscii(bytes: Uint8Array, text: string): number {
  const expected = [...text].map((char) => char.charCodeAt(0));
  for (let offset = 0; offset <= bytes.length - expected.length; offset += 1) {
    if (expected.every((byte, index) => bytes[offset + index] === byte)) {
      return offset;
    }
  }
  return -1;
}

function readAscii(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}

function readUint16(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] ?? 0) << 8) + (bytes[offset + 1] ?? 0);
}

function uint16Bytes(value: number): readonly number[] {
  return [(value >> 8) & 0xff, value & 0xff];
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

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  return new Uint8Array([...binary].map((char) => char.charCodeAt(0)));
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}
