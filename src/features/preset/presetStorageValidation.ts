type StoredPreset = {
  id: string;
  name: string;
  description?: string;
  routineTemplates?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export const isStoredPreset = (value: unknown): value is StoredPreset => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    (candidate.description === undefined ||
      typeof candidate.description === "string")
  );
};
