import type { DetailTestCase } from "./detailedTestCases";
import { calculateStatusFromDetails } from "./statusHelpers";
import type { CheckStatus, TestCategory, TestItem } from "./types";

export type DetailData = Record<string, DetailTestCase[]>;

/**
 * 詳細ケースの保存用形式。
 * scenario / expected は DETAILED_TEST_CASES から補完できるため、
 * saveTestMatrixDetailData が保存前にこの形式へ正規化して localStorage へ書き込む。
 * 読み込み時は mergeStoredDetailData で DETAILED_TEST_CASES の値を補完して DetailData へ復元する。
 */
export type StoredDetailCase = Pick<
  DetailTestCase,
  "id" | "pc" | "sp" | "note"
>;
export type StoredDetailData = Record<string, StoredDetailCase[]>;

export type ResolvedItemStatus = {
  detailCases: DetailTestCase[];
  hasDetail: boolean;
  pcStatus: CheckStatus;
  spStatus: CheckStatus;
};

export type MatrixOverviewStats = {
  totalCount: number;
  okCount: number;
  ngCount: number;
  uncheckedCount: number;
  progressPct: number;
};

export type CategoryStats = {
  okCount: number;
  ngCount: number;
  totalCount: number;
};

export const resolveItemStatus = (
  item: TestItem,
  detailData: DetailData,
): ResolvedItemStatus => {
  const detailCases = detailData[item.id] || [];
  const hasDetail = detailCases.length > 0;
  const pcStatus = hasDetail
    ? calculateStatusFromDetails(detailCases, "pc")
    : item.pc;
  const spStatus = hasDetail
    ? calculateStatusFromDetails(detailCases, "sp")
    : item.sp;

  return { detailCases, hasDetail, pcStatus, spStatus };
};

export const isItemMatchedByFilter = (
  item: TestItem,
  detailData: DetailData,
  filterStatus: CheckStatus | "all",
): boolean => {
  if (filterStatus === "all") return true;

  const { pcStatus, spStatus } = resolveItemStatus(item, detailData);
  return pcStatus === filterStatus || spStatus === filterStatus;
};

export const calculateCategoryStats = (
  category: TestCategory,
  detailData: DetailData,
): CategoryStats => {
  const resolved = category.items.map((item) =>
    resolveItemStatus(item, detailData),
  );

  const okCount = resolved.filter(
    (status) => status.pcStatus === "ok" && status.spStatus === "ok",
  ).length;

  const ngCount = resolved.filter(
    (status) => status.pcStatus === "ng" || status.spStatus === "ng",
  ).length;

  return {
    okCount,
    ngCount,
    totalCount: category.items.length,
  };
};

export const calculateOverviewStats = (
  categories: TestCategory[],
  detailData: DetailData,
): MatrixOverviewStats => {
  const resolved = categories
    .flatMap((category) => category.items)
    .map((item) => resolveItemStatus(item, detailData));

  const totalCount = resolved.length;
  const okCount = resolved.filter(
    (status) => status.pcStatus === "ok" && status.spStatus === "ok",
  ).length;
  const ngCount = resolved.filter(
    (status) => status.pcStatus === "ng" || status.spStatus === "ng",
  ).length;
  const uncheckedCount = resolved.filter(
    (status) =>
      status.pcStatus === "unchecked" || status.spStatus === "unchecked",
  ).length;

  const progressPct =
    totalCount > 0
      ? Math.round(((totalCount - uncheckedCount) / totalCount) * 100)
      : 0;

  return { totalCount, okCount, ngCount, uncheckedCount, progressPct };
};
