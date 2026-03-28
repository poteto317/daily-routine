type RunHeaderLogoutParams = {
  confirmLogout: () => boolean;
  signOut: () => Promise<void>;
  closeMenu: () => void;
  alertError: () => void;
};

export const runHeaderLogout = async ({
  confirmLogout,
  signOut,
  closeMenu,
  alertError,
}: RunHeaderLogoutParams): Promise<boolean> => {
  if (!confirmLogout()) {
    return false;
  }

  try {
    await signOut();
    closeMenu();
    return true;
  } catch {
    alertError();
    return false;
  }
};
