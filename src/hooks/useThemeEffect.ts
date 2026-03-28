"use client";

import { useThemeAutoListenerEffect } from "./useThemeAutoListenerEffect";
import { useThemeInitializationEffect } from "./useThemeInitializationEffect";

export const useThemeEffect = () => {
  useThemeInitializationEffect();
  useThemeAutoListenerEffect();
};
