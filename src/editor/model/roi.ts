import type { Rect } from "./geometry";

export interface RoiFrameStyle {
  readonly visible: boolean;
  readonly stroke: string;
  readonly strokeWidth: number;
}

export interface RegionOfInterest {
  readonly id: string;
  readonly sourceImageId: string;
  readonly sourceObjectId: string;
  readonly rect: Rect;
  readonly frame: RoiFrameStyle;
}

