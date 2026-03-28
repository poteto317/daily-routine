import type { TodoList } from "./types";

type ActionHandlers = ReturnType<
  typeof import("./useTodoListManagementActionHandlers").useTodoListManagementActionHandlers
>;

type CreateTodoListManagementDataStateResultArgs = {
  lists: TodoList[];
  actionHandlers: ActionHandlers;
};

export const createTodoListManagementDataStateResult = ({
  lists,
  actionHandlers,
}: CreateTodoListManagementDataStateResultArgs) => ({
  lists,
  ...actionHandlers,
});
