"use client";

export type TodoListUndoRedoControlsProps = {
  onUndoAction?: () => void;
  onRedoAction?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
};

export const TodoListUndoRedoControls = ({
  onUndoAction,
  onRedoAction,
  canUndo,
  canRedo,
}: TodoListUndoRedoControlsProps) => (
  <>
    <button
      type="button"
      disabled={!canUndo || !onUndoAction}
      onClick={onUndoAction}
      aria-label="元に戻す"
      className="text-sm text-gray-500 dark:text-gray-600 hover:text-teal-600 dark:hover:text-teal-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      ↩
    </button>
    <button
      type="button"
      disabled={!canRedo || !onRedoAction}
      onClick={onRedoAction}
      aria-label="やり直す"
      className="text-sm text-gray-500 dark:text-gray-600 hover:text-teal-600 dark:hover:text-teal-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      ↪
    </button>
  </>
);
