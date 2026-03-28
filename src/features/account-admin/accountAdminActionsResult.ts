type AccountAdminActionsResultArgs = {
  actionLoading: boolean;
  handleCreate: (event: React.FormEvent) => Promise<void>;
  handleUpdate: (event: React.FormEvent) => Promise<void>;
  handleDelete: (account: import("./types").Account) => Promise<void>;
};

export const createAccountAdminActionsResult = ({
  actionLoading,
  handleCreate,
  handleUpdate,
  handleDelete,
}: AccountAdminActionsResultArgs) => {
  return {
    actionLoading,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
};
