"use client";

import { useEffect } from "react";
import { applyStoredTheme, getSafeTheme } from "./themeEffectActions";

export const useThemeAutoListenerEffect = () => {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (getSafeTheme() === "auto") {
        applyStoredTheme(mediaQuery);
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);
};
