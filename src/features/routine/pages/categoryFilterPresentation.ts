import texts from "../locales/ja.json";

export const CATEGORY_FILTER_TEXT = texts.categoryFilter;

export const getCategoryFilterButtonClassName = (
  isSelected: boolean,
  selectedCategoryClassName?: string,
): string => {
  if (!isSelected) {
    return "bg-white dark:bg-slate-100 text-gray-700 dark:text-gray-800 border border-gray-300 hover:bg-gray-50 dark:hover:bg-slate-200";
  }

  return selectedCategoryClassName
    ? `${selectedCategoryClassName} ring-2 ring-blue-500 shadow-md`
    : "bg-blue-600 text-white shadow-md";
};
