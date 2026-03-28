"use client";

import { createContext, useContext } from "react";
import type { PageType } from "./types";

const NavigationContext = createContext<((page: PageType) => void) | null>(null);

export const NavigationContextProvider = NavigationContext.Provider;

export const useNavigationContext = (): ((page: PageType) => void) => {
  const fn = useContext(NavigationContext);
  if (!fn) throw new Error("useNavigationContext must be used within PageLayout");
  return fn;
};
