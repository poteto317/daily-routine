import { toJstDateKey } from "@/lib/storage/core";
/** 統計の日付キー。JST 基準にしないと日本時間の 0〜9 時が前日になる */
export const formatDate = (date: Date) => toJstDateKey(date);

export const buildDateString = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export const calculateRate = (completed: number, total: number) =>
  total > 0 ? (completed / total) * 100 : 0;
