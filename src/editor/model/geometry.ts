export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface Rect extends Point, Size {}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function normalizeRect(start: Point, end: Point): Rect {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  return { x, y, width, height };
}

export function hasRenderableArea(rect: Size): boolean {
  return rect.width > 0 && rect.height > 0;
}

export function fitWithin(size: Size, bounds: Size): Size {
  const widthRatio = bounds.width / size.width;
  const heightRatio = bounds.height / size.height;
  const ratio = Math.min(widthRatio, heightRatio, 1);
  return {
    width: Math.round(size.width * ratio),
    height: Math.round(size.height * ratio),
  };
}

export function clampRectToSize(rect: Rect, size: Size): Rect {
  const x = clamp(rect.x, 0, size.width);
  const y = clamp(rect.y, 0, size.height);
  const right = clamp(rect.x + rect.width, 0, size.width);
  const bottom = clamp(rect.y + rect.height, 0, size.height);
  return {
    x,
    y,
    width: Math.max(0, right - x),
    height: Math.max(0, bottom - y),
  };
}

export function constrainRectWithinBounds(rect: Rect, bounds: Size): Rect {
  const width = clamp(rect.width, 0, bounds.width);
  const height = clamp(rect.height, 0, bounds.height);
  return {
    x: clamp(rect.x, 0, bounds.width - width),
    y: clamp(rect.y, 0, bounds.height - height),
    width,
    height,
  };
}

export function constrainRectPosition(rect: Rect, bounds: Size): Rect {
  return {
    ...rect,
    x: clamp(rect.x, 0, bounds.width - rect.width),
    y: clamp(rect.y, 0, bounds.height - rect.height),
  };
}

export function constrainRectWithinRect(rect: Rect, bounds: Rect): Rect {
  const width = clamp(rect.width, 0, bounds.width);
  const height = clamp(rect.height, 0, bounds.height);
  return {
    x: clamp(rect.x, bounds.x, bounds.x + bounds.width - width),
    y: clamp(rect.y, bounds.y, bounds.y + bounds.height - height),
    width,
    height,
  };
}
