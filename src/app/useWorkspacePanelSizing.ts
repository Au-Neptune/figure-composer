import { useEffect, useMemo, useState } from "react";

const DEFAULT_LEFT_PANEL_WIDTH = 250;
const DEFAULT_RIGHT_PANEL_WIDTH = 280;
const MIN_LEFT_PANEL_WIDTH = 210;
const MIN_RIGHT_PANEL_WIDTH = 230;
const MIN_STAGE_WIDTH = 320;
const SPLITTER_WIDTH = 8;

type PanelSide = "left" | "right";

interface DragState {
  readonly side: PanelSide;
  readonly startX: number;
  readonly startLeftWidth: number;
  readonly startRightWidth: number;
}

export interface WorkspacePanelSizing {
  readonly leftPanelWidth: number;
  readonly rightPanelWidth: number;
  readonly gridTemplateColumns: string;
  readonly startPanelResize: (side: PanelSide, event: React.PointerEvent) => void;
}

export function useWorkspacePanelSizing(): WorkspacePanelSizing {
  const [leftPanelWidth, setLeftPanelWidth] = useState(DEFAULT_LEFT_PANEL_WIDTH);
  const [rightPanelWidth, setRightPanelWidth] = useState(DEFAULT_RIGHT_PANEL_WIDTH);
  const [dragState, setDragState] = useState<DragState | null>(null);
  usePanelDragEffect(dragState, { leftPanelWidth, rightPanelWidth }, {
    setLeftPanelWidth,
    setRightPanelWidth,
    setDragState,
  });
  const gridTemplateColumns = useMemo(
    () => createGridTemplate(leftPanelWidth, rightPanelWidth),
    [leftPanelWidth, rightPanelWidth],
  );
  return {
    leftPanelWidth,
    rightPanelWidth,
    gridTemplateColumns,
    startPanelResize: (side, event) =>
      startPanelResize(side, event, leftPanelWidth, rightPanelWidth, setDragState),
  };
}

function startPanelResize(
  side: PanelSide,
  event: React.PointerEvent,
  leftPanelWidth: number,
  rightPanelWidth: number,
  setDragState: (state: DragState) => void,
): void {
  event.preventDefault();
  event.currentTarget.setPointerCapture(event.pointerId);
  setDragState({
    side,
    startX: event.clientX,
    startLeftWidth: leftPanelWidth,
    startRightWidth: rightPanelWidth,
  });
}

function usePanelDragEffect(
  dragState: DragState | null,
  widths: { readonly leftPanelWidth: number; readonly rightPanelWidth: number },
  actions: {
    readonly setLeftPanelWidth: (width: number) => void;
    readonly setRightPanelWidth: (width: number) => void;
    readonly setDragState: (state: DragState | null) => void;
  },
): void {
  useEffect(() => {
    if (!dragState) {
      return;
    }
    const handlePointerMove = (event: PointerEvent) =>
      updatePanelWidths(event, dragState, widths, actions);
    const stopResize = () => actions.setDragState(null);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResize);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResize);
    };
  }, [actions, dragState, widths]);
}

function updatePanelWidths(
  event: PointerEvent,
  dragState: DragState,
  widths: { readonly leftPanelWidth: number; readonly rightPanelWidth: number },
  actions: {
    readonly setLeftPanelWidth: (width: number) => void;
    readonly setRightPanelWidth: (width: number) => void;
  },
): void {
  const delta = event.clientX - dragState.startX;
  if (dragState.side === "left") {
    actions.setLeftPanelWidth(clampPanelWidth(dragState.startLeftWidth + delta, "left", widths.rightPanelWidth));
    return;
  }
  actions.setRightPanelWidth(clampPanelWidth(dragState.startRightWidth - delta, "right", widths.leftPanelWidth));
}

function clampPanelWidth(width: number, side: PanelSide, otherPanelWidth: number): number {
  const minWidth = side === "left" ? MIN_LEFT_PANEL_WIDTH : MIN_RIGHT_PANEL_WIDTH;
  const maxWidth = getMaxPanelWidth(otherPanelWidth, minWidth);
  return Math.min(Math.max(Math.round(width), minWidth), maxWidth);
}

function getMaxPanelWidth(otherPanelWidth: number, minWidth: number): number {
  const viewportWidth = window.innerWidth;
  const available = viewportWidth - otherPanelWidth - MIN_STAGE_WIDTH - SPLITTER_WIDTH * 2;
  return Math.max(minWidth, available);
}

function createGridTemplate(leftWidth: number, rightWidth: number): string {
  return `${leftWidth}px ${SPLITTER_WIDTH}px minmax(0, 1fr) ${SPLITTER_WIDTH}px ${rightWidth}px`;
}
