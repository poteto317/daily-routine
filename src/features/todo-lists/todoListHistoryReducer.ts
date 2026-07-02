import type { TodoList } from "./types";

export const MAX_HISTORY = 50;

export type HistoryState = {
  past: TodoList[][];
  present: TodoList[];
  future: TodoList[][];
};

export type HistoryAction =
  | { type: "PERSIST"; payload: TodoList[] }
  | { type: "UNDO" }
  | { type: "REDO" };

export const createInitialHistoryState = (
  getInitialLists: () => TodoList[],
): HistoryState => ({
  past: [],
  present: getInitialLists(),
  future: [],
});

export const isUndoable = (state: HistoryState): boolean =>
  state.past.length > 0;

export const isRedoable = (state: HistoryState): boolean =>
  state.future.length > 0;

export const getPrevState = (state: HistoryState): TodoList[] | null =>
  state.past.length > 0 ? state.past[state.past.length - 1] : null;

export const getNextState = (state: HistoryState): TodoList[] | null =>
  state.future.length > 0 ? state.future[0] : null;

// lists.map() は常に新配列を返すため、要素参照がすべて同一の no-op を履歴から除外する
const isNoOpPersist = (prev: TodoList[], next: TodoList[]): boolean =>
  prev.length === next.length && next.every((list, i) => list === prev[i]);

export function todoListHistoryReducer(
  state: HistoryState,
  action: HistoryAction,
): HistoryState {
  switch (action.type) {
    case "PERSIST":
      if (isNoOpPersist(state.present, action.payload)) return state;
      return {
        past: [...state.past.slice(-(MAX_HISTORY - 1)), state.present],
        present: action.payload,
        future: [],
      };
    case "UNDO": {
      if (state.past.length === 0) return state;
      const prev = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: prev,
        future: [state.present, ...state.future],
      };
    }
    case "REDO": {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      };
    }
    default: {
      const _exhaustiveCheck: never = action;
      void _exhaustiveCheck;
      return state;
    }
  }
}
