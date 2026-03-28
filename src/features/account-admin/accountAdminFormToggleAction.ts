type AccountAdminFormToggleActionArgs = {
  cancelEdit: () => void;
  toggleCreateFormBase: () => void;
};

export const createAccountAdminToggleCreateFormAction = ({
  cancelEdit,
  toggleCreateFormBase,
}: AccountAdminFormToggleActionArgs) => {
  return () => {
    toggleCreateFormBase();
    cancelEdit();
  };
};
