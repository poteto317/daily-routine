import { useCallback } from "react";
import { uiTextConfig } from "@/config";
import { runHeaderLogout } from "@/hooks/headerLogoutActions";
import { createHeaderLogoutResult } from "@/hooks/headerLogoutResult";

type UseHeaderLogoutParams = {
  signOut: () => Promise<void>;
  closeMenu: () => void;
};

export const useHeaderLogout = ({
  signOut,
  closeMenu,
}: UseHeaderLogoutParams) => {
  const handleLogout = useCallback(async () => {
    await runHeaderLogout({
      confirmLogout: () => confirm(uiTextConfig.auth.logout.confirm),
      signOut,
      closeMenu,
      alertError: () => alert(uiTextConfig.auth.logout.error),
    });
  }, [closeMenu, signOut]);

  return createHeaderLogoutResult({
    handleLogout,
  });
};
