import testMatrixTexts from "./locales/ja.json";

export const getTotalCasesLabel = (allCases: number): string =>
  `/ ${allCases} ${testMatrixTexts.detailPanel.totalCasesSuffix}`;

export const getDeviceTitleText = (
  device: string,
  statusLabel: string,
): string => {
  return `${device}: ${statusLabel}`;
};

export const getCollapseIcon = (isCollapsed: boolean): string =>
  isCollapsed ? "▶" : "▼";

export const getStatusTitle = (
  device: "PC" | "SP",
  statusLabel: string,
  hasDetail: boolean,
): string =>
  hasDetail
    ? `${device}: ${statusLabel} (詳細画面から自動計算)`
    : `${device}: ${statusLabel}`;

export const getCollapseAllButtonLabel = (collapseAll: boolean): string =>
  collapseAll
    ? testMatrixTexts.page.expandAll
    : testMatrixTexts.page.collapseAll;

export const getTotalItemsLabel = (totalCount: number): string =>
  `/ ${totalCount} ${testMatrixTexts.page.totalItemsSuffix}`;
