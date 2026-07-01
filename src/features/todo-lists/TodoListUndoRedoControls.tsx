"use client";

export type TodoListUndoRedoControlsProps = {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
};

export const TodoListUndoRedoControls = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: TodoListUndoRedoControlsProps) => (
  <>
    <button
      type="button"
      disabled={!canUndo}
      onClick={onUndo}
      aria-label="元に戻す"
      className="text-sm text-gray-500 dark:text-gray-600 hover:text-teal-600 dark:hover:text-teal-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      ↩
    </button>
    <button
      type="button"
      disabled={!canRedo}
      onClick={onRedo}
      aria-label="やり直す"
      className="text-sm text-gray-500 dark:text-gray-600 hover:text-teal-600 dark:hover:text-teal-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      ↪
    </button>
  </>
);
