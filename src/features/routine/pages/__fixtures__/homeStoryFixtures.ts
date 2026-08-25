import type { TrainDelayInfo } from "@/types/routine";
import type { HomeDisplaySummary, HomeToolbarProps } from "../homeTypes";
import { fn } from "storybook/test";

export const sortedDaysAndHoliday: HomeToolbarProps["view"]["sortedDaysAndHoliday"] =
  [
    { value: 1, label: "月曜日" },
    { value: 2, label: "火曜日" },
    { value: 3, label: "水曜日" },
    { value: 4, label: "木曜日" },
    { value: 5, label: "金曜日" },
    { value: 6, label: "土曜日" },
    { value: 0, label: "日曜日" },
    "holiday",
  ];

export const sampleTrainDelay: TrainDelayInfo = {
  lineId: "jr-chuo",
  lineName: "中央線",
  company: "JR東日本",
  delayMinutes: 10,
  reason: "人身事故",
  section: "新宿〜立川",
  lastUpdated: "2026-05-23T08:30:00+09:00",
};

export const baseDisplay: HomeDisplaySummary = {
  completedMinutes: 20,
  totalMinutes: 35,
  progressPercentage: 57,
};

// ファクトリ関数: 呼び出しごとに新鮮な fn() インスタンスを返す。
// 静的エクスポートにすると ES モジュールキャッシュで fn() が共有され
// クロスストーリー汚染が起きるため、必ずファクトリ経由で生成すること。
export const createBaseView = (): HomeToolbarProps["view"] => ({
  currentDate: "2026年5月23日(土)",
  isTodayHoliday: false,
  isEditMode: false,
  toggleEditModeAction: fn(),
  viewMode: 6,
  setViewModeAction: fn(),
  filterCategory: "all",
  setFilterCategoryAction: fn(),
  sortedDaysAndHoliday,
});
