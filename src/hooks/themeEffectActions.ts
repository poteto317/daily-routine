import { getSettings } from "@/lib/storage";

export const getSafeTheme = (): "light" | "dark" | "auto" => {
  try {
    return getSettings().theme;
  } catch {
    return "auto";
  }
};

export const applyThemeToDocument = (
  theme: "light" | "dark" | "auto",
  prefersDark: boolean,
) => {
  document.documentElement.classList.remove("light", "dark");

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    return;
  }

  if (theme === "light") {
    document.documentElement.classList.add("light");
    return;
  }

  if (prefersDark) {
    document.documentElement.classList.add("dark");
  }
};

export const applyStoredTheme = (mediaQuery: MediaQueryList) => {
  applyThemeToDocument(getSafeTheme(), mediaQuery.matches);
};
