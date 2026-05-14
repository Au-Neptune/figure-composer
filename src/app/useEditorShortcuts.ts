import { useEffect } from "react";

interface EditorShortcutsOptions {
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
}

export function useEditorShortcuts({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: EditorShortcutsOptions): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreShortcut(event)) {
        return;
      }
      if (isUndoShortcut(event) && canUndo) {
        event.preventDefault();
        onUndo();
      }
      if (isRedoShortcut(event) && canRedo) {
        event.preventDefault();
        onRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canRedo, canUndo, onRedo, onUndo]);
}

function shouldIgnoreShortcut(event: KeyboardEvent): boolean {
  const target = event.target;
  return target instanceof HTMLInputElement || target instanceof HTMLSelectElement;
}

function isUndoShortcut(event: KeyboardEvent): boolean {
  return isCommandKey(event) && event.key.toLowerCase() === "z" && !event.shiftKey;
}

function isRedoShortcut(event: KeyboardEvent): boolean {
  const key = event.key.toLowerCase();
  return isCommandKey(event) && (key === "y" || (key === "z" && event.shiftKey));
}

function isCommandKey(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey;
}

