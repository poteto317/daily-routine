"use client";

import { getActionBarMode } from "./todoListActionStatusBarMode";
import { TodoListSelectionBar } from "./TodoListSelectionBar";
import { TodoListClipboardBar } from "./TodoListClipboardBar";

export type TodoListActionStatusBarProps = {
  hasSelection: boolean;
  hasClipboard: boolean;
  selectedCount: number;
  clipboardCount: number;
  onCut: () => void;
  onClearSelection: () => void;
  onPaste: () => void;
  onClearClipboard: () => void;
};

export const TodoListActionStatusBar = ({
  hasSelection,
  hasClipboard,
  selectedCount,
  clipboardCount,
  onCut,
  onClearSelection,
  onPaste,
  onClearClipboard,
}: TodoListActionStatusBarProps) => {
  const mode = getActionBarMode(hasSelection, hasClipboard);

  if (mode === "selection") {
    return (
      <TodoListSelectionBar
        selectedCount={selectedCount}
        onCut={onCut}
        onClearSelection={onClearSelection}
      />
    );
  }
  if (mode === "clipboard") {
    return (
      <TodoListClipboardBar
        clipboardCount={clipboardCount}
        onPaste={onPaste}
        onClearClipboard={onClearClipboard}
      />
    );
  }
  return null;
};
