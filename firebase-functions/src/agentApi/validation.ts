import { ApiError } from "./errors";

export type JsonObject = Record<string, unknown>;

const MAX_AMOUNT = 1_000_000_000;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const invalidField = (field: string, message: string): ApiError =>
  new ApiError(400, "invalid_field", `${field}: ${message}`);

export const asJsonObject = (value: unknown): JsonObject => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ApiError(
      400,
      "invalid_body",
      "リクエストボディは JSON オブジェクトで指定してください",
    );
  }
  return value as JsonObject;
};

export const assertKnownKeys = (
  body: JsonObject,
  allowed: readonly string[],
): void => {
  const unknownKeys = Object.keys(body).filter((key) => !allowed.includes(key));
  if (unknownKeys.length > 0) {
    throw new ApiError(
      400,
      "unknown_field",
      `未対応のフィールドです: ${unknownKeys.join(", ")}`,
    );
  }
};

export const required = <T>(field: string, value: T | undefined): T => {
  if (value === undefined) {
    throw invalidField(field, "必須です");
  }
  return value;
};

export const compact = <T extends Record<string, unknown>>(
  value: T,
): Partial<T> =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as Partial<T>;

type StringOptions = {
  maxLength: number;
  trim?: boolean;
  allowEmpty?: boolean;
};

export const readString = (
  body: JsonObject,
  field: string,
  options: StringOptions,
): string | undefined => {
  const raw = body[field];
  if (raw === undefined) return undefined;
  if (typeof raw !== "string") {
    throw invalidField(field, "文字列で指定してください");
  }
  const value = options.trim ? raw.trim() : raw;
  if (value.length === 0 && !options.allowEmpty) {
    throw invalidField(field, "空にはできません");
  }
  if (value.length > options.maxLength) {
    throw invalidField(field, `${options.maxLength} 文字以内で指定してください`);
  }
  return value;
};

export const readAmount = (
  body: JsonObject,
  field: string,
): number | undefined => {
  const raw = body[field];
  if (raw === undefined) return undefined;
  if (
    typeof raw !== "number" ||
    !Number.isFinite(raw) ||
    raw <= 0 ||
    raw > MAX_AMOUNT
  ) {
    throw invalidField(field, `0 より大きく ${MAX_AMOUNT} 以下の数値で指定してください`);
  }
  return raw;
};

const isRealDate = (value: string): boolean => {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

export const readDate = (
  body: JsonObject,
  field: string,
): string | undefined => {
  const raw = body[field];
  if (raw === undefined) return undefined;
  if (typeof raw !== "string" || !DATE_PATTERN.test(raw) || !isRealDate(raw)) {
    throw invalidField(field, "YYYY-MM-DD 形式の実在する日付で指定してください");
  }
  return raw;
};

export const readMonth = (
  body: JsonObject,
  field: string,
): string | undefined => {
  const raw = body[field];
  if (raw === undefined) return undefined;
  if (typeof raw !== "string" || !MONTH_PATTERN.test(raw)) {
    throw invalidField(field, "YYYY-MM 形式で指定してください");
  }
  return raw;
};

export const readTime = (
  body: JsonObject,
  field: string,
): string | undefined => {
  const raw = body[field];
  if (raw === undefined) return undefined;
  if (typeof raw !== "string" || !TIME_PATTERN.test(raw)) {
    throw invalidField(field, "HH:mm 形式で指定してください");
  }
  return raw;
};

export const readEnum = <T extends string>(
  body: JsonObject,
  field: string,
  values: readonly T[],
): T | undefined => {
  const raw = body[field];
  if (raw === undefined) return undefined;
  if (typeof raw !== "string" || !values.includes(raw as T)) {
    throw invalidField(field, `${values.join(" / ")} のいずれかを指定してください`);
  }
  return raw as T;
};

export const parseQueryMonth = (value: string | undefined): string | undefined => {
  if (value === undefined) return undefined;
  if (!MONTH_PATTERN.test(value)) {
    throw new ApiError(400, "invalid_query", "month は YYYY-MM 形式で指定してください");
  }
  return value;
};

export const parseQueryDate = (value: string | undefined): string | undefined => {
  if (value === undefined) return undefined;
  if (!DATE_PATTERN.test(value) || !isRealDate(value)) {
    throw new ApiError(
      400,
      "invalid_query",
      "date は YYYY-MM-DD 形式の実在する日付で指定してください",
    );
  }
  return value;
};
