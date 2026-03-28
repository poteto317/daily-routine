import { createTodoListDetailHandlerBindings } from "./todoListDetailHandlerBindings";
import { createTodoListDetailStateResult } from "./todoListDetailStateResult";
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

  return createTodoListDetailStateResult({
    detailHandlers,
    list: data.list,
  });
};
