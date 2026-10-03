import type { SyncDocData } from "../syncDoc";

export const readArray = <T>(data: SyncDocData, field: string): T[] => {
  const value = data[field];
  return Array.isArray(value) ? (value as T[]) : [];
};

export const readObject = (
  data: SyncDocData,
  field: string,
): Record<string, unknown> => {
  const value = data[field];
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
};
