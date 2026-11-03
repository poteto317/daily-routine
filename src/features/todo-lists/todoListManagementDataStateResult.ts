import type { TodoList } from "./types";

type ActionHandlers = ReturnType<
  typeof import("./useTodoListManagementActionHandlers").useTodoListManagementActionHandlers
>;

type CreateTodoListManagementDataStateResultArgs = {
  lists: TodoList[];
  actionHandlers: ActionHandlers;
  handleReorderLists: (activeListId: string, overListId: string) => void;
};

export const createTodoListManagementDataStateResult = ({
  lists,
  actionHandlers,
  handleReorderLists,
}: CreateTodoListManagementDataStateResultArgs) => ({
  lists,
  ...actionHandlers,
  handleReorderLists,
});
