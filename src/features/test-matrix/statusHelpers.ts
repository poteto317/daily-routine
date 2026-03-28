import type { DetailTestCase } from "./detailedTestCases";
import type { CheckStatus, TestField } from "./types";

const STATUS_CYCLE: CheckStatus[] = ["unchecked", "ok", "ng", "na"];

export const STATUS_DISPLAY: Record<
  CheckStatus,
  { label: string; emoji: string; color: string }
> = {
  unchecked: {
    label: "未確認",
    emoji: "⬜",
    color: "bg-gray-100 text-gray-500",
  },
  ok: { label: "OK", emoji: "✅", color: "bg-green-100 text-green-700" },
  ng: { label: "NG", emoji: "❌", color: "bg-red-100 text-red-700" },
  na: { label: "対象外", emoji: "➖", color: "bg-gray-200 text-gray-500" },
};

export const nextStatus = (status: CheckStatus): CheckStatus => {
  const index = STATUS_CYCLE.indexOf(status);
  return STATUS_CYCLE[(index + 1) % STATUS_CYCLE.length];
};

export const calculateStatusFromDetails = (
  detailCases: DetailTestCase[],
  field: TestField,
): CheckStatus => {
  if (detailCases.length === 0) return "unchecked";

  const statuses = detailCases.map((detailCase) => detailCase[field]);

  if (statuses.some((status) => status === "ng")) {
    return "ng";
  }

  if (statuses.every((status) => status === "ok")) {
    return "ok";
  }

  if (statuses.every((status) => status === "na")) {
    return "na";
  }

  return "unchecked";
};
