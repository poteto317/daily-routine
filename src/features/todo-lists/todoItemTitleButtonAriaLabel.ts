import texts from "./locales/ja.json";

type BuildTodoItemTitleButtonAriaLabelParams = {
  title: string;
  isCompleted: boolean;
  isSelected: boolean;
};

/**
 * TodoItemTitleButtonのaria-labelを組み立てる。
 * 完了状態に応じた基本ラベルに、選択中であれば接尾辞を付与する。
 */
export const buildTodoItemTitleButtonAriaLabel = ({
  title,
  isCompleted,
  isSelected,
}: BuildTodoItemTitleButtonAriaLabelParams): string => {
  const baseLabel = isCompleted
    ? `「${title}」を未完了に戻す`
    : `「${title}」を完了にする`;
  return isSelected
    ? `${baseLabel}${texts.list.itemSelectedSuffix}`
    : baseLabel;
};
