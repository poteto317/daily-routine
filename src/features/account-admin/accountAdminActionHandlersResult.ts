type CreateHandler = ReturnType<
  typeof import("./useAccountAdminCreateHandler").useAccountAdminCreateHandler
>;
type UpdateHandler = ReturnType<
  typeof import("./useAccountAdminUpdateHandler").useAccountAdminUpdateHandler
>;
type DeleteHandler = ReturnType<
  typeof import("./useAccountAdminDeleteHandler").useAccountAdminDeleteHandler
>;

type CreateAccountAdminActionHandlersResultArgs = {
  handleCreate: CreateHandler;
  handleUpdate: UpdateHandler;
  handleDelete: DeleteHandler;
};

export const createAccountAdminActionHandlersResult = ({
  handleCreate,
  handleUpdate,
  handleDelete,
}: CreateAccountAdminActionHandlersResultArgs) => ({
  handleCreate,
  handleUpdate,
  handleDelete,
});
