import { useState } from "react";
import { createLoginActionRuntimeStateResult } from "./loginActionRuntimeStateResult";

export const useLoginActionRuntimeState = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return createLoginActionRuntimeStateResult({
    error,
    loading,
    setError,
    setLoading,
  });
};
