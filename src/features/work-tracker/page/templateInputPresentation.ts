import workTrackerTexts from "../locales/ja.json";

export const shouldShowTemplateDropdown = (
  showTemplateDropdown: boolean,
  workName: string,
): boolean => showTemplateDropdown && workName.length > 0;

export const getTemplateStatsSummaryLabel = (
  count: number,
  bestDurationText: string,
): string => {
  const { bestPrefix, countSuffix } = workTrackerTexts.templateInput;
  return `${count}${countSuffix} | ${bestPrefix} ${bestDurationText}`;
};

export const formatNewWorkNameLabel = (workName: string): string =>
  `「${workName}」`;
