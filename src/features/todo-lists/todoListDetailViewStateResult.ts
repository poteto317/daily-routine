type DetailFormState = ReturnType<
  typeof import("./useTodoListDetailFormState").useTodoListDetailFormState
>;
type DetailComputedState = ReturnType<
  typeof import("./useTodoListDetailComputedState").useTodoListDetailComputedState
>;
type DetailEditingState = ReturnType<
  typeof import("./useTodoListDetailEditingState").useTodoListDetailEditingState
>;

type CreateTodoListDetailViewStateResultArgs = {
  detailForm: DetailFormState;
  detailComputed: DetailComputedState;
  detailEditing: DetailEditingState;
};

export const createTodoListDetailViewStateResult = ({
  detailForm,
  detailComputed,
  detailEditing,
}: CreateTodoListDetailViewStateResultArgs) => ({
  ...detailForm,
  ...detailComputed,
  ...detailEditing,
});
