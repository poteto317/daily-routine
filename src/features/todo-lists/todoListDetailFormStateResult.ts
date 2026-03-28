type InputState = ReturnType<
  typeof import("./useTodoListDetailInputState").useTodoListDetailInputState
>;

type CreateTodoListDetailFormStateResultArgs = {
  inputState: InputState;
  handleAdd: () => boolean;
};

export const createTodoListDetailFormStateResult = ({
  inputState,
  handleAdd,
}: CreateTodoListDetailFormStateResultArgs) => ({
  dragOverIndex: inputState.dragOverIndex,
  handleAdd,
  inputRef: inputState.inputRef,
  inputText: inputState.inputText,
  setDragOverIndex: inputState.setDragOverIndex,
  setInputText: inputState.setInputText,
});
