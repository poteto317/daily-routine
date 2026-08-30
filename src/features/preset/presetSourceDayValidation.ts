import { HOLIDAY_DAY_VALUE } from "@/types/routine";

export const isPresetSourceDay = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= 0 &&
  value <= HOLIDAY_DAY_VALUE;
