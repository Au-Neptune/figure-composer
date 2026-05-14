import type {
  Figure,
  FigureObject,
  InsetDockSide,
  InsetObject,
} from "../model/figure";
import type { Rect } from "../model/geometry";
import { getFigureObject } from "../model/selectors";
import { DEFAULT_INSET_GAP } from "./editorDefaults";

export function getInsetObject(figure: Figure, objectId: string): InsetObject {
  const object = getFigureObject(figure, objectId);
  if (object.kind !== "inset") {
    throw new Error(`Figure object is not an Inset: ${objectId}`);
  }
  return object;
}

export function createDockedInsetBounds(
  inset: InsetObject,
  sourceObject: FigureObject,
  side: InsetDockSide,
): Rect {
  const centeredX = sourceObject.x + (sourceObject.width - inset.width) / 2;
  const centeredY = sourceObject.y + (sourceObject.height - inset.height) / 2;
  switch (side) {
    case "top":
      return {
        ...inset,
        x: centeredX,
        y: sourceObject.y - inset.height - DEFAULT_INSET_GAP,
      };
    case "right":
      return {
        ...inset,
        x: sourceObject.x + sourceObject.width + DEFAULT_INSET_GAP,
        y: centeredY,
      };
    case "bottom":
      return {
        ...inset,
        x: centeredX,
        y: sourceObject.y + sourceObject.height + DEFAULT_INSET_GAP,
      };
    case "left":
      return {
        ...inset,
        x: sourceObject.x - inset.width - DEFAULT_INSET_GAP,
        y: centeredY,
      };
  }
}
