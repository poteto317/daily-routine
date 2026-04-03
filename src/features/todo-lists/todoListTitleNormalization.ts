export const normalizeTitle = (title: string): string | null => {
  const trimmed = title.trim();
  return trimmed || null;
};
