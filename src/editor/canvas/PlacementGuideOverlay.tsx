import type { ReactElement } from "react";
import { Line } from "react-konva";
import type { Size } from "../model/geometry";
import type { PlacementGuide } from "../model/placementSnapping";

const GUIDE_STROKE = "#28766f";
const GUIDE_STROKE_WIDTH = 1;
const GUIDE_DASH = [6, 4] as const;

interface PlacementGuideOverlayProps {
  readonly canvas: Size;
  readonly guides: readonly PlacementGuide[];
}

export function PlacementGuideOverlay({
  canvas,
  guides,
}: PlacementGuideOverlayProps): ReactElement | null {
  if (guides.length === 0) {
    return null;
  }
  return (
    <>
      {guides.map((guide, index) => (
        <Line
          key={`${guide.axis}-${guide.position}-${index}`}
          points={createGuidePoints(guide, canvas)}
          stroke={GUIDE_STROKE}
          strokeWidth={GUIDE_STROKE_WIDTH}
          dash={[...GUIDE_DASH]}
          listening={false}
        />
      ))}
    </>
  );
}

function createGuidePoints(
  guide: PlacementGuide,
  canvas: Size,
): number[] {
  if (guide.axis === "x") {
    return [guide.position, 0, guide.position, canvas.height];
  }
  return [0, guide.position, canvas.width, guide.position];
}
