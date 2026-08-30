import {
  ROUTINE_CATEGORIES,
  type RoutineCategory,
  type RoutineTemplate,
} from "@/types/routine";

const VALID_CATEGORIES = new Set<RoutineCategory>(
  ROUTINE_CATEGORIES.map(({ value }) => value),
);
const VALID_START_TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const isOptionalString = (value: unknown): boolean =>
  value === undefined || typeof value === "string";

const isOptionalNonNegativeInteger = (value: unknown): boolean =>
  value === undefined ||
  (typeof value === "number" && Number.isInteger(value) && value >= 0);

export const hasPresetRoutineCoreFields = (
  value: unknown,
): value is RoutineTemplate => {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.startTime === "string" &&
    VALID_START_TIME.test(candidate.startTime) &&
    typeof candidate.duration === "number" &&
    Number.isInteger(candidate.duration) &&
    candidate.duration >= 1 &&
    candidate.duration <= 1440 &&
    typeof candidate.category === "string" &&
    VALID_CATEGORIES.has(candidate.category as RoutineCategory) &&
    isOptionalString(candidate.description) &&
    isOptionalNonNegativeInteger(candidate.notificationMinutes)
  );
};
