import type { FigureObject } from "./figure";
import type { Rect, Size } from "./geometry";
import { constrainRectWithinBounds } from "./geometry";

export type PlacementGuideAxis = "x" | "y";

export interface PlacementGuide {
  readonly axis: PlacementGuideAxis;
  readonly position: number;
}

export interface PlacementSnapResult {
  readonly rect: Rect;
  readonly guides: readonly PlacementGuide[];
}

interface SnapRectOptions {
  readonly rect: Rect;
  readonly canvas: Size;
  readonly objects: readonly FigureObject[];
  readonly activeObjectId: string;
  readonly threshold: number;
}

interface ResizeSnapOptions extends SnapRectOptions {
  readonly oldRect: Rect;
  readonly minSize: number;
}

interface SnapCandidate {
  readonly offset: number;
  readonly guide: PlacementGuide;
}

export function snapRectToPlacementTargets({
  rect,
  canvas,
  objects,
  activeObjectId,
  threshold,
}: SnapRectOptions): PlacementSnapResult {
  const constrained = constrainRectWithinBounds(rect, canvas);
  const targets = createPlacementTargets(canvas, objects, activeObjectId);
  const xSnap = findBestSnap({
    axis: "x",
    anchors: createAxisAnchors(constrained.x, constrained.width),
    targets: targets.x,
    rect: constrained,
    canvas,
    threshold,
  });
  const ySnap = findBestSnap({
    axis: "y",
    anchors: createAxisAnchors(constrained.y, constrained.height),
    targets: targets.y,
    rect: constrained,
    canvas,
    threshold,
  });
  return {
    rect: {
      ...constrained,
      x: constrained.x + (xSnap?.offset ?? 0),
      y: constrained.y + (ySnap?.offset ?? 0),
    },
    guides: [xSnap?.guide, ySnap?.guide].filter(isPlacementGuide),
  };
}

export function snapResizeRectToPlacementTargets({
  oldRect,
  rect,
  canvas,
  objects,
  activeObjectId,
  threshold,
  minSize,
}: ResizeSnapOptions): PlacementSnapResult {
  const targets = createPlacementTargets(canvas, objects, activeObjectId);
  const xSnap = snapResizeAxis({
    axis: "x",
    oldStart: oldRect.x,
    oldLength: oldRect.width,
    nextStart: rect.x,
    nextLength: rect.width,
    targets: targets.x,
    threshold,
    minSize,
    canvasLength: canvas.width,
  });
  const ySnap = snapResizeAxis({
    axis: "y",
    oldStart: oldRect.y,
    oldLength: oldRect.height,
    nextStart: rect.y,
    nextLength: rect.height,
    targets: targets.y,
    threshold,
    minSize,
    canvasLength: canvas.height,
  });
  return {
    rect: { x: xSnap.start, y: ySnap.start, width: xSnap.length, height: ySnap.length },
    guides: [...xSnap.guides, ...ySnap.guides],
  };
}

function createPlacementTargets(
  canvas: Size,
  objects: readonly FigureObject[],
  activeObjectId: string,
): { readonly x: readonly number[]; readonly y: readonly number[] } {
  const objectTargets = objects
    .filter((object) => object.id !== activeObjectId)
    .map((object) => ({
      x: createAxisAnchors(object.x, object.width),
      y: createAxisAnchors(object.y, object.height),
    }));
  return {
    x: [0, canvas.width / 2, canvas.width, ...objectTargets.flatMap((item) => item.x)],
    y: [0, canvas.height / 2, canvas.height, ...objectTargets.flatMap((item) => item.y)],
  };
}

function createAxisAnchors(start: number, length: number): readonly number[] {
  return [start, start + length / 2, start + length];
}

function snapResizeAxis({
  axis,
  oldStart,
  oldLength,
  nextStart,
  nextLength,
  targets,
  threshold,
  minSize,
  canvasLength,
}: {
  readonly axis: PlacementGuideAxis;
  readonly oldStart: number;
  readonly oldLength: number;
  readonly nextStart: number;
  readonly nextLength: number;
  readonly targets: readonly number[];
  readonly threshold: number;
  readonly minSize: number;
  readonly canvasLength: number;
}): { readonly start: number; readonly length: number; readonly guides: readonly PlacementGuide[] } {
  const oldEnd = oldStart + oldLength;
  const nextEnd = nextStart + nextLength;
  const startSnap = findTargetSnap(nextStart, targets, axis, threshold);
  const endSnap = findTargetSnap(nextEnd, targets, axis, threshold);
  const startResult = applyStartResizeSnap({
    start: nextStart,
    end: nextEnd,
    snap: startMoved(oldStart, nextStart) ? startSnap : null,
    minSize,
    canvasLength,
  });
  const endResult = applyEndResizeSnap({
    start: startResult.start,
    end: startResult.end,
    snap: endMoved(oldEnd, nextEnd) ? endSnap : null,
    minSize,
    canvasLength,
  });
  return {
    start: endResult.start,
    length: endResult.end - endResult.start,
    guides: [startResult.guide, endResult.guide].filter(isPlacementGuide),
  };
}

function findBestSnap({
  axis,
  anchors,
  targets,
  rect,
  canvas,
  threshold,
}: {
  readonly axis: PlacementGuideAxis;
  readonly anchors: readonly number[];
  readonly targets: readonly number[];
  readonly rect: Rect;
  readonly canvas: Size;
  readonly threshold: number;
}): SnapCandidate | null {
  const candidates = anchors.flatMap((anchor) =>
    targets.map((target) => ({ offset: target - anchor, guide: { axis, position: target } })),
  );
  return candidates.reduce<SnapCandidate | null>((best, candidate) => {
    if (Math.abs(candidate.offset) > threshold) {
      return best;
    }
    if (!offsetKeepsRectInCanvas(rect, axis, candidate.offset, canvas)) {
      return best;
    }
    return isBetterCandidate(candidate, best) ? candidate : best;
  }, null);
}

function findTargetSnap(
  position: number,
  targets: readonly number[],
  axis: PlacementGuideAxis,
  threshold: number,
): SnapCandidate | null {
  return targets.reduce<SnapCandidate | null>((best, target) => {
    const candidate = { offset: target - position, guide: { axis, position: target } };
    if (Math.abs(candidate.offset) > threshold) {
      return best;
    }
    return isBetterCandidate(candidate, best) ? candidate : best;
  }, null);
}

function applyStartResizeSnap({
  start,
  end,
  snap,
  minSize,
  canvasLength,
}: {
  readonly start: number;
  readonly end: number;
  readonly snap: SnapCandidate | null;
  readonly minSize: number;
  readonly canvasLength: number;
}): { readonly start: number; readonly end: number; readonly guide?: PlacementGuide } {
  if (!snap) {
    return { start, end };
  }
  const nextStart = start + snap.offset;
  return validAxisBounds(nextStart, end, minSize, canvasLength)
    ? { start: nextStart, end, guide: snap.guide }
    : { start, end };
}

function applyEndResizeSnap({
  start,
  end,
  snap,
  minSize,
  canvasLength,
}: {
  readonly start: number;
  readonly end: number;
  readonly snap: SnapCandidate | null;
  readonly minSize: number;
  readonly canvasLength: number;
}): { readonly start: number; readonly end: number; readonly guide?: PlacementGuide } {
  if (!snap) {
    return { start, end };
  }
  const nextEnd = end + snap.offset;
  return validAxisBounds(start, nextEnd, minSize, canvasLength)
    ? { start, end: nextEnd, guide: snap.guide }
    : { start, end };
}

function offsetKeepsRectInCanvas(
  rect: Rect,
  axis: PlacementGuideAxis,
  offset: number,
  canvas: Size,
): boolean {
  const x = axis === "x" ? rect.x + offset : rect.x;
  const y = axis === "y" ? rect.y + offset : rect.y;
  return x >= 0 && y >= 0 && x + rect.width <= canvas.width && y + rect.height <= canvas.height;
}

function validAxisBounds(
  start: number,
  end: number,
  minSize: number,
  canvasLength: number,
): boolean {
  return start >= 0 && end <= canvasLength && end - start >= minSize;
}

function startMoved(oldStart: number, nextStart: number): boolean {
  return oldStart !== nextStart;
}

function endMoved(oldEnd: number, nextEnd: number): boolean {
  return oldEnd !== nextEnd;
}

function isBetterCandidate(candidate: SnapCandidate, best: SnapCandidate | null): boolean {
  return !best || Math.abs(candidate.offset) < Math.abs(best.offset);
}

function isPlacementGuide(
  guide: PlacementGuide | undefined,
): guide is PlacementGuide {
  return Boolean(guide);
}
