import type { useTodoListDetailItemEditingActions } from "./useTodoListDetailItemEditingActions";
import type { useTodoListDetailItemEditingState } from "./useTodoListDetailItemEditingState";

type TodoListDetailItemEditingState = ReturnType<
  typeof useTodoListDetailItemEditingState
>;
type TodoListDetailItemEditingActions = ReturnType<
  typeof useTodoListDetailItemEditingActions
>;

type CreateTodoListDetailItemEditingResultArgs = {
  itemEditingState: TodoListDetailItemEditingState;
  itemEditingActions: TodoListDetailItemEditingActions;
};

export const createTodoListDetailItemEditingResult = ({
  itemEditingState,
  itemEditingActions,
}: CreateTodoListDetailItemEditingResultArgs) => {
  return {
    ...itemEditingState,
    ...itemEditingActions,
  };
};
