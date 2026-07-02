import { useCallback, useReducer, useRef } from "react";
import type { TodoList } from "./types";
import {
  todoListHistoryReducer,
  createInitialHistoryState,
  isUndoable,
  isRedoable,
  getPrevState,
  getNextState,
  isNoOpPersist,
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

  // キーリピート等で同一レンダー内に複数回呼ばれても最新の履歴を参照するためのミラー ref。
  // render 中は current を読み書きせず、persist/undo/redo callbacks 内でのみ更新する。
  const historyRef = useRef(createInitialHistoryState(getInitialLists));

  const persist = useCallback((next: TodoList[]) => {
    if (isNoOpPersist(historyRef.current.present, next)) return;
    historyRef.current = todoListHistoryReducer(historyRef.current, { type: "PERSIST", payload: next });
    dispatch({ type: "PERSIST", payload: next });
    saveLists(next);
  }, [saveLists]);

  const undo = useCallback(() => {
    const prev = getPrevState(historyRef.current);
    if (!prev) return;
    historyRef.current = todoListHistoryReducer(historyRef.current, { type: "UNDO" });
    dispatch({ type: "UNDO" });
    saveLists(prev);
  }, [saveLists]);

  const redo = useCallback(() => {
    const next = getNextState(historyRef.current);
    if (!next) return;
    historyRef.current = todoListHistoryReducer(historyRef.current, { type: "REDO" });
    dispatch({ type: "REDO" });
    saveLists(next);
  }, [saveLists]);

  return {
    lists: history.present,
    persist,
    undo,
    redo,
    canUndo: isUndoable(history),
    canRedo: isRedoable(history),
  };
};
