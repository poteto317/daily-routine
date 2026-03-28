"use client";

import { useEffect } from "react";
import { applyStoredTheme } from "./themeEffectActions";

export const useThemeInitializationEffect = () => {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    applyStoredTheme(mediaQuery);
  }, []);
};
