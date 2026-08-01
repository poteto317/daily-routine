"use client";

import { getActionBarMode } from "./todoListActionStatusBarMode";
import { TodoListSelectionBar } from "./TodoListSelectionBar";
import { TodoListClipboardBar } from "./TodoListClipboardBar";

export type TodoListActionStatusBarProps = {
  hasSelection: boolean;
  hasClipboard: boolean;
  selectedCount: number;
  clipboardCount: number;
  onCutAction: () => void;
  onClearSelectionAction: () => void;
  onPasteAction: () => void;
  onClearClipboardAction: () => void;
};

export const TodoListActionStatusBar = ({
  hasSelection,
  hasClipboard,
  selectedCount,
  clipboardCount,
  onCutAction,
  onClearSelectionAction,
  onPasteAction,
  onClearClipboardAction,
}: TodoListActionStatusBarProps) => {
  const mode = getActionBarMode(hasSelection, hasClipboard);

  if (mode === "selection") {
    return (
      <TodoListSelectionBar
        selectedCount={selectedCount}
        onCutAction={onCutAction}
        onClearSelectionAction={onClearSelectionAction}
      />
    );
  }
  if (mode === "clipboard") {
    return (
      <TodoListClipboardBar
        clipboardCount={clipboardCount}
        onPasteAction={onPasteAction}
        onClearClipboardAction={onClearClipboardAction}
      />
    );
  }
  return null;
};
