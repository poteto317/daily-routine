import { useCallback, useReducer } from "react";
import type { TodoList } from "./types";
import {
  todoListHistoryReducer,
  createInitialHistoryState,
  isUndoable,
  isRedoable,
  getPrevState,
  getNextState,
} from "./todoListHistoryReducer";

type UseTodoListHistoryParams = {
  getInitialLists: () => TodoList[];
  saveLists: (lists: TodoList[]) => void;
};

export const useTodoListHistory = ({
  getInitialLists,
  saveLists,
}: UseTodoListHistoryParams) => {
  const [history, dispatch] = useReducer(
    todoListHistoryReducer,
    undefined,
    () => createInitialHistoryState(getInitialLists),
  );

  const persist = useCallback((next: TodoList[]) => {
    dispatch({ type: "PERSIST", payload: next });
    saveLists(next);
  }, [saveLists]);

  const undo = () => {
    const prev = getPrevState(history);
    if (!prev) return;
    dispatch({ type: "UNDO" });
    saveLists(prev);
  };

  const redo = () => {
    const next = getNextState(history);
    if (!next) return;
    dispatch({ type: "REDO" });
    saveLists(next);
  };

  return {
    lists: history.present,
    persist,
    undo,
    redo,
    canUndo: isUndoable(history),
    canRedo: isRedoable(history),
  };
};
