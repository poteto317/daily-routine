export const normalizeCategoryName = (name: string): string | null => {
  const trimmed = name.trim();
  return trimmed || null;
};
