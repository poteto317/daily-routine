import type { SyncDocData } from "../syncDoc";
import { isJsonObject } from "../validation/body";

export const readArray = <T>(data: SyncDocData, field: string): T[] => {
  const value = data[field];
  return Array.isArray(value) ? (value as T[]) : [];
};

export const readObject = (
  data: SyncDocData,
  field: string,
): Record<string, unknown> => {
  const value = data[field];
  return isJsonObject(value) ? value : {};
};
