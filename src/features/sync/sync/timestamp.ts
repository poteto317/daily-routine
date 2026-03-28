export const extractTimestamp = (value: unknown): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

export const collectLatestTimestamp = (value: unknown): number => {
  if (!value || typeof value !== "object") return 0;

  if (Array.isArray(value)) {
    return value.reduce(
      (max, item) => Math.max(max, collectLatestTimestamp(item)),
      0,
    );
  }

  let latest = 0;
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (
      key === "updatedAt" ||
      key === "createdAt" ||
      key === "lastResetTime" ||
      key === "lastModified"
    ) {
      latest = Math.max(latest, extractTimestamp(entry));
    }

    latest = Math.max(latest, collectLatestTimestamp(entry));
  }

  return latest;
};
