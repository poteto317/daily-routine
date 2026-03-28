"use client";

import { useContext } from "react";
import { AuthContext } from "./AuthContextInstance";
import { AUTH_ERROR_MESSAGES } from "./constants";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error(AUTH_ERROR_MESSAGES.useAuthOutsideProvider);
  return context;
};
