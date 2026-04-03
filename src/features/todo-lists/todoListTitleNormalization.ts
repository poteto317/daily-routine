export const normalizeTodoTitle = (title: string): string | null => {
  const trimmed = title.trim();
  return trimmed || null;
};
