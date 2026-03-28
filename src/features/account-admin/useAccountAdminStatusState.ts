import { useState } from "react";
import { createAccountAdminStatusStateResult } from "./accountAdminStatusStateResult";

export const useAccountAdminStatusState = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return createAccountAdminStatusStateResult({
    error,
    isAdmin,
    loading,
    setError,
    setIsAdmin,
    setLoading,
  });
};
