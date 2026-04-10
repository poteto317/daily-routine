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
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  useAuthSync({ setUser, setIsAdmin, setLoading, setIsAdminLoading });

  const actions = useAuthActions();

  const value = {
    user,
    loading,
    isAdmin,
    isAdminLoading,
    ...actions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
