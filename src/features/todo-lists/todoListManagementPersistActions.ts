import type { TodoList } from "./types";
import { saveAndSyncTodoLists } from "./sync";
import { persistManagedTodoLists } from "./managementPageStateActions";

type SetValue<T> = (value: T) => void;

export const createManagedTodoListsPersistAction = (params: {
  setLists: SetValue<TodoList[]>;
}) => {
  const { setLists } = params;

  return (nextLists: TodoList[]) => {
    persistManagedTodoLists({
      nextLists,
      setLists,
      saveLists: saveAndSyncTodoLists,
    });
  };
};
