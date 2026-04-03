import { normalizeTitle } from "./todoListTitleNormalization";
import type { TodoList } from "./types";
import {
  deleteTodoListAndPersist,
  updateTodoListTitleAndPersist,
} from "./pageStateActions";

type TodoListsHandlerArgs = {
  lists: TodoList[];
  persist: (next: TodoList[]) => void;
};

export const createDeleteTodoListHandler = ({
  lists,
  persist,
  deleteListConfirmTemplate,
}: TodoListsHandlerArgs & {
  deleteListConfirmTemplate: (title: string) => string;
}) => {
  return (target: TodoList) => {
    deleteTodoListAndPersist({
      lists,
      list: target,
      message: deleteListConfirmTemplate(target.title),
      persist,
    });
  };
};

export const createUpdateListTitleHandler = ({
  lists,
  persist,
}: TodoListsHandlerArgs) => {
  return (listId: string, title: string) => {
    const normalized = normalizeTitle(title);
    if (!normalized) return;
    updateTodoListTitleAndPersist({
      lists,
      listId,
      title: normalized,
      persist,
    });
  };
};
