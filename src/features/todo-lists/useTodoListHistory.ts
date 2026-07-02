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

  // getPrevState/getNextState に history オブジェクト全体を渡すため
  // React Compiler は history を依存として推論する。history.past/future を
  // 個別に指定すると Compiler の推論と不一致でエラーになるため history 全体を dep にする
  const undo = useCallback(() => {
    const prev = getPrevState(history);
    if (!prev) return;
    dispatch({ type: "UNDO" });
    saveLists(prev);
  }, [history, saveLists]);

  const redo = useCallback(() => {
    const next = getNextState(history);
    if (!next) return;
    dispatch({ type: "REDO" });
    saveLists(next);
  }, [history, saveLists]);

  return {
    lists: history.present,
    persist,
    undo,
    redo,
    canUndo: isUndoable(history),
    canRedo: isRedoable(history),
  };
};
