import { useTodoListDetailAddAction } from "./useTodoListDetailAddAction";
import { createTodoListDetailFormStateResult } from "./todoListDetailFormStateResult";
import { useTodoListDetailInputState } from "./useTodoListDetailInputState";

type UseTodoListDetailFormStateParams = {
  listId: string;
  onAddItem: (listId: string, title: string) => void;
};

export const useTodoListDetailFormState = ({
  listId,
  onAddItem,
}: UseTodoListDetailFormStateParams) => {
  const inputState = useTodoListDetailInputState();
  const { handleAdd } = useTodoListDetailAddAction({
    inputText: inputState.inputText,
    listId,
    onAddItem,
    setInputText: inputState.setInputText,
    inputRef: inputState.inputRef,
  });

  return createTodoListDetailFormStateResult({
    inputState,
    handleAdd,
  });
};
