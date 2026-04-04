/** アイテム背景色の選択肢 */
export const TODO_ITEM_BG_COLORS = [
  { value: undefined, label: "デフォルト", class: "bg-white dark:bg-gray-700" },
  { value: "bg-red-50", label: "赤", class: "bg-red-50 dark:bg-red-900/30" },
  {
    value: "bg-orange-50",
    label: "オレンジ",
    class: "bg-orange-50 dark:bg-orange-900/30",
  },
  {
    value: "bg-yellow-50",
    label: "黄",
    class: "bg-yellow-50 dark:bg-yellow-900/30",
  },
  {
    value: "bg-green-50",
    label: "緑",
    class: "bg-green-50 dark:bg-green-900/30",
  },
  { value: "bg-blue-50", label: "青", class: "bg-blue-50 dark:bg-blue-900/30" },
  {
    value: "bg-purple-50",
    label: "紫",
    class: "bg-purple-50 dark:bg-purple-900/30",
  },
  {
    value: "bg-pink-50",
    label: "ピンク",
    class: "bg-pink-50 dark:bg-pink-900/30",
  },
] as const;

/**
 * TODO_ITEM_BG_COLORS の value から undefined を除いた union 型。
 * 色を追加・変更する場合は TODO_ITEM_BG_COLORS のみ編集すれば型も自動追従する。
 */
export type TodoItemBgColorValue = Exclude<
  (typeof TODO_ITEM_BG_COLORS)[number]["value"],
  undefined
>;

/** bgColor 値から表示用クラスを取得 */
export const getTodoItemBgClass = (bgColor?: TodoItemBgColorValue): string => {
  const found = TODO_ITEM_BG_COLORS.find((c) => c.value === bgColor);
  return found?.class ?? TODO_ITEM_BG_COLORS[0].class;
};
