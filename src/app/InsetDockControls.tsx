import type { ReactElement } from "react";
import type { Figure, InsetDockSide, InsetObject } from "../editor/model/figure";

interface InsetDockControlsProps {
  readonly figure: Figure;
  readonly onDockInset: (objectId: string, side: InsetDockSide) => void;
}

const DOCK_SIDES: readonly { readonly label: string; readonly side: InsetDockSide }[] = [
  { label: "Top", side: "top" },
  { label: "Right", side: "right" },
  { label: "Bottom", side: "bottom" },
  { label: "Left", side: "left" },
];

export function InsetDockControls({
  figure,
  onDockInset,
}: InsetDockControlsProps): ReactElement | null {
  const inset = getSelectedInset(figure);
  if (!inset) {
    return null;
  }
  return (
    <div className="inspector-section">
      <h2>Inset Placement</h2>
      <div className="button-grid">
        {DOCK_SIDES.map((item) => (
          <button
            key={item.side}
            className="small-button"
            type="button"
            onClick={() => onDockInset(inset.id, item.side)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function getSelectedInset(figure: Figure): InsetObject | null {
  const object = figure.objects.find((item) => item.id === figure.selectedObjectId);
  return object?.kind === "inset" ? object : null;
}

