import type { PersistTodoLists, TodoList } from "./types";
import { updateTodoListTitleInLists } from "./detailActions";

type UpdateTodoListTitleArgs = {
  lists: TodoList[];
  listId: string;
  title: string;
  persist: PersistTodoLists;
};

export const updateTodoListTitleAndPersist = ({
  lists,
  listId,
  title,
  persist,
}: UpdateTodoListTitleArgs): TodoList[] => {
  const nextLists = updateTodoListTitleInLists({ lists, listId, title });
  persist(nextLists);
  return nextLists;
};
