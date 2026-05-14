import type Konva from "konva";
import type { Point } from "../model/geometry";

export function getStagePointer(stage: Konva.Stage): Point {
  const pointer = stage.getPointerPosition();
  if (!pointer) {
    throw new Error("Stage pointer position is unavailable.");
  }
  return pointer;
}

