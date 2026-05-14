import { useEffect } from "react";

interface EditorShortcutsOptions {
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly canDeleteSelection: boolean;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly onDeleteSelection: () => void;
}

export function useEditorShortcuts({
  canUndo,
  canRedo,
  canDeleteSelection,
  onUndo,
  onRedo,
  onDeleteSelection,
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
      if (isDeleteShortcut(event) && canDeleteSelection) {
        event.preventDefault();
        onDeleteSelection();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canDeleteSelection, canRedo, canUndo, onDeleteSelection, onRedo, onUndo]);
}

function shouldIgnoreShortcut(event: KeyboardEvent): boolean {
  const target = event.target;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement ||
    isEditableElement(target)
  );
}

function isUndoShortcut(event: KeyboardEvent): boolean {
  return isCommandKey(event) && event.key.toLowerCase() === "z" && !event.shiftKey;
}

function isRedoShortcut(event: KeyboardEvent): boolean {
  const key = event.key.toLowerCase();
  return isCommandKey(event) && (key === "y" || (key === "z" && event.shiftKey));
}

function isDeleteShortcut(event: KeyboardEvent): boolean {
  return (
    !isCommandKey(event) &&
    !event.altKey &&
    (event.key === "Delete" || event.key === "Backspace")
  );
}

function isCommandKey(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey;
}

function isEditableElement(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.isContentEditable;
}
