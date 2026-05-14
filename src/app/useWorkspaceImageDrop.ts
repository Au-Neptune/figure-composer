import { useState } from "react";
import type { DragEvent } from "react";
import type { ImportFilesHandler } from "./sourceImageImport";

interface WorkspaceImageDrop {
  readonly dropActive: boolean;
  readonly handleDragEnter: (event: DragEvent<HTMLElement>) => void;
  readonly handleDragOver: (event: DragEvent<HTMLElement>) => void;
  readonly handleDragLeave: (event: DragEvent<HTMLElement>) => void;
  readonly handleDrop: (event: DragEvent<HTMLElement>) => void;
}

export function useWorkspaceImageDrop(
  importFiles: ImportFilesHandler,
): WorkspaceImageDrop {
  const [dropDepth, setDropDepth] = useState(0);
  return {
    dropActive: dropDepth > 0,
    handleDragEnter: (event) => handleDragEnter(event, setDropDepth),
    handleDragOver,
    handleDragLeave: (event) => handleDragLeave(event, setDropDepth),
    handleDrop: (event) => {
      handleDrop(event, setDropDepth, importFiles);
    },
  };
}

function handleDragEnter(
  event: DragEvent<HTMLElement>,
  setDropDepth: (updater: (depth: number) => number) => void,
): void {
  if (!hasDraggedFiles(event)) {
    return;
  }
  event.preventDefault();
  setDropDepth((depth) => depth + 1);
}

function handleDragOver(event: DragEvent<HTMLElement>): void {
  if (!hasDraggedFiles(event)) {
    return;
  }
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
}

function handleDragLeave(
  event: DragEvent<HTMLElement>,
  setDropDepth: (updater: (depth: number) => number) => void,
): void {
  if (!hasDraggedFiles(event)) {
    return;
  }
  setDropDepth((depth) => Math.max(0, depth - 1));
}

function handleDrop(
  event: DragEvent<HTMLElement>,
  setDropDepth: (depth: number) => void,
  importFiles: ImportFilesHandler,
): void {
  if (!hasDraggedFiles(event)) {
    return;
  }
  event.preventDefault();
  setDropDepth(0);
  void importFiles(Array.from(event.dataTransfer.files));
}

function hasDraggedFiles(event: DragEvent<HTMLElement>): boolean {
  const items = Array.from(event.dataTransfer.items);
  return items.some((item) => item.kind === "file");
}
