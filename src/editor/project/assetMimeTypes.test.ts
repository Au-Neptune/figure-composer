import { describe, expect, it } from "vitest";
import { getAssetMimeType } from "./assetMimeTypes";

describe("getAssetMimeType", () => {
  it.each([
    ["source.png", "image/png"],
    ["source.JPG", "image/jpeg"],
    ["source.jpeg", "image/jpeg"],
    ["source.webp", "image/webp"],
    ["source.bin", "application/octet-stream"],
    ["source", "application/octet-stream"],
  ])("returns %s as %s", (fileName, mimeType) => {
    expect(getAssetMimeType(fileName)).toBe(mimeType);
  });
});
