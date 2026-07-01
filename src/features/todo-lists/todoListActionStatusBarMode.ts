export type ActionBarMode = "selection" | "clipboard" | "none";

export const getActionBarMode = (
  hasSelection: boolean,
  hasClipboard: boolean,
): ActionBarMode => {
  if (hasSelection) return "selection";
  if (hasClipboard) return "clipboard";
  return "none";
};
