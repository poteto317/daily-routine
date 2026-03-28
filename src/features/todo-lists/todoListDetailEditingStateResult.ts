import type { useTodoListDetailItemEditing } from "./useTodoListDetailItemEditing";
import type { useTodoListDetailTitleEditing } from "./useTodoListDetailTitleEditing";

type TodoListDetailItemEditing = ReturnType<
  typeof useTodoListDetailItemEditing
>;
type TodoListDetailTitleEditing = ReturnType<
  typeof useTodoListDetailTitleEditing
>;

type CreateTodoListDetailEditingStateResultArgs = {
  itemEditing: TodoListDetailItemEditing;
  titleEditing: TodoListDetailTitleEditing;
};

export const createTodoListDetailEditingStateResult = ({
  itemEditing,
  titleEditing,
}: CreateTodoListDetailEditingStateResultArgs) => {
  return {
    ...itemEditing,
    ...titleEditing,
  };
};
