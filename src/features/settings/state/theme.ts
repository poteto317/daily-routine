export const applyTheme = (theme: "light" | "dark" | "auto") => {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    return;
  }
  if (theme === "light") {
    document.documentElement.classList.remove("dark");
    return;
  }
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};
