type CreateHeaderLogoutResultArgs = {
  handleLogout: () => Promise<void>;
};

export const createHeaderLogoutResult = ({
  handleLogout,
}: CreateHeaderLogoutResultArgs) => {
  return {
    handleLogout,
  };
};
