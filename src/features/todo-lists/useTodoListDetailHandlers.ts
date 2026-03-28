import { createTodoListDetailHandlers } from "./todoListPageViewActions";
import type { TodoList } from "./types";
import texts from "./locales/ja.json";

type TodoListPersist = (next: TodoList[]) => void;

export const useTodoListDetailHandlers = ({
  list,
  lists,
  persist,
}: {
  list: TodoList | null;
  lists: TodoList[];
  persist: TodoListPersist;
}) => {
  if (!list) {
    return {
      detailHandlers: null,
    };
  }

  return {
    detailHandlers: createTodoListDetailHandlers({
      lists,
      persist,
      deleteItemConfirmTemplate: (title) =>
        texts.list.deleteItemConfirm.replace("{title}", title),
      deleteListConfirmTemplate: (title) =>
        texts.list.deleteListConfirm.replace("{title}", title),
    }),
  };
};
