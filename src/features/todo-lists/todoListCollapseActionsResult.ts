type TodoListCollapseActionsResultInput = {
  toggleCollapseItem: (itemId: string) => void;
};

export const createTodoListCollapseActionsResult = ({
  toggleCollapseItem,
}: TodoListCollapseActionsResultInput) => ({
  toggleCollapseItem,
});
