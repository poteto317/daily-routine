export const normalizePresetMetadata = (
  name: string,
  description?: string,
): { name: string; description: string | undefined } => ({
  name: name.trim(),
  description: description?.trim() || undefined,
});
