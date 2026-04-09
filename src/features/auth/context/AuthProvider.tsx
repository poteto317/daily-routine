"use client";

import React, { useState } from "react";
import { type User } from "firebase/auth";
import { useAuthSync } from "@/hooks/useAuthSync";
import { AuthContext } from "./AuthContextInstance";
import { useAuthActions } from "./useAuthActions";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useAuthSync({ setUser, setIsAdmin, setLoading });

  const actions = useAuthActions();

  const value = {
    user,
    loading,
    isAdmin,
    ...actions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
