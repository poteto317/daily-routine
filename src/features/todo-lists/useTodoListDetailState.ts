import { createTodoListDetailHandlerBindings } from "./todoListDetailHandlerBindings";
import { useTodoListDetailDataState } from "./useTodoListDetailDataState";
import { useTodoListDetailHandlers } from "./useTodoListDetailHandlers";

export const useTodoListDetailState = (listId: string) => {
  const data = useTodoListDetailDataState(listId);
  const { detailHandlers } = useTodoListDetailHandlers(
    createTodoListDetailHandlerBindings({
      list: data.list,
      lists: data.lists,
      persist: data.persist,
    }),
  );

  return {
    detailHandlers,
    list: data.list,
    undo: data.undo,
    redo: data.redo,
    canUndo: data.canUndo,
    canRedo: data.canRedo,
  };
};
