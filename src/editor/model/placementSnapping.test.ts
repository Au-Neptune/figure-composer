import { describe, expect, it } from "vitest";
import type { FigureObject } from "./figure";
import {
  snapRectToPlacementTargets,
  snapResizeRectToPlacementTargets,
} from "./placementSnapping";

const CANVAS = { width: 400, height: 300 };
const THRESHOLD = 8;
const MIN_SIZE = 24;

describe("snapRectToPlacementTargets", () => {
  it("snaps an object edge to the canvas edge", () => {
    const result = snapRectToPlacementTargets({
      rect: { x: 6, y: 40, width: 100, height: 80 },
      canvas: CANVAS,
      objects: [createObject({ id: "active", x: 10, y: 40, width: 100, height: 80 })],
      activeObjectId: "active",
      threshold: THRESHOLD,
    });

    expect(result.rect.x).toBe(0);
    expect(result.guides).toContainEqual({ axis: "x", position: 0 });
  });

  it("snaps an object edge to another object edge", () => {
    const result = snapRectToPlacementTargets({
      rect: { x: 185, y: 40, width: 50, height: 80 },
      canvas: CANVAS,
      objects: [
        createObject({ id: "other", x: 100, y: 40, width: 80, height: 80 }),
        createObject({ id: "active", x: 185, y: 40, width: 50, height: 80 }),
      ],
      activeObjectId: "active",
      threshold: THRESHOLD,
    });

    expect(result.rect.x).toBe(180);
    expect(result.guides).toContainEqual({ axis: "x", position: 180 });
  });

  it("snaps an object center to the canvas center", () => {
    const result = snapRectToPlacementTargets({
      rect: { x: 153, y: 100, width: 90, height: 60 },
      canvas: CANVAS,
      objects: [createObject({ id: "active", x: 153, y: 100, width: 90, height: 60 })],
      activeObjectId: "active",
      threshold: THRESHOLD,
    });

    expect(result.rect.x).toBe(155);
    expect(result.guides).toContainEqual({ axis: "x", position: 200 });
  });

  it("does not snap when targets are outside the threshold", () => {
    const result = snapRectToPlacementTargets({
      rect: { x: 25, y: 40, width: 100, height: 80 },
      canvas: CANVAS,
      objects: [createObject({ id: "active", x: 25, y: 40, width: 100, height: 80 })],
      activeObjectId: "active",
      threshold: THRESHOLD,
    });

    expect(result.rect.x).toBe(25);
    expect(result.guides).toHaveLength(0);
  });
});

describe("snapResizeRectToPlacementTargets", () => {
  it("snaps a resized object edge to the canvas edge", () => {
    const result = snapResizeRectToPlacementTargets({
      oldRect: { x: 100, y: 40, width: 120, height: 80 },
      rect: { x: 100, y: 40, width: 296, height: 80 },
      canvas: CANVAS,
      objects: [createObject({ id: "active", x: 100, y: 40, width: 120, height: 80 })],
      activeObjectId: "active",
      threshold: THRESHOLD,
      minSize: MIN_SIZE,
    });

    expect(result.rect.width).toBe(300);
    expect(result.guides).toContainEqual({ axis: "x", position: 400 });
  });

  it("snaps a resized object edge to another object edge", () => {
    const result = snapResizeRectToPlacementTargets({
      oldRect: { x: 220, y: 40, width: 80, height: 80 },
      rect: { x: 184, y: 40, width: 116, height: 80 },
      canvas: CANVAS,
      objects: [
        createObject({ id: "other", x: 100, y: 40, width: 80, height: 80 }),
        createObject({ id: "active", x: 220, y: 40, width: 80, height: 80 }),
      ],
      activeObjectId: "active",
      threshold: THRESHOLD,
      minSize: MIN_SIZE,
    });

    expect(result.rect.x).toBe(180);
    expect(result.rect.width).toBe(120);
    expect(result.guides).toContainEqual({ axis: "x", position: 180 });
  });
});

function createObject({
  id,
  x,
  y,
  width,
  height,
}: {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}): FigureObject {
  return {
    id,
    kind: "sourceImage",
    sourceImageId: `source_${id}`,
    x,
    y,
    width,
    height,
  };
}
