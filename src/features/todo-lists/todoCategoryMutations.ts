import { arrayMove } from "@dnd-kit/sortable";
import type { TodoCategory } from "./types";
import type { TodoItemBgColorValue } from "./todoItemBgColor";
import { createTodoCategory } from "./todoCategoryFactory";
import { normalizeCategoryName } from "./todoCategoryNameNormalization";

/**
 * カテゴリを追加する。名前が空白のみの場合は追加せず同じ配列を返す。
 */
export const addTodoCategory = (
  categories: TodoCategory[],
  name: string,
  color?: TodoItemBgColorValue,
): TodoCategory[] => {
  const normalized = normalizeCategoryName(name);
  if (!normalized) return categories;

  return [...categories, createTodoCategory(normalized, color)];
};

/**
 * カテゴリ名を変更する。
 */
export const renameTodoCategory = (
  categories: TodoCategory[],
  categoryId: string,
  name: string,
): TodoCategory[] =>
  categories.map((category) =>
    category.id === categoryId ? { ...category, name } : category,
  );

/**
 * カテゴリの背景色を変更する。undefined を渡すとデフォルト（アイテム自身の
 * bgColor にフォールバック）に戻す。
 */
export const updateTodoCategoryColor = (
  categories: TodoCategory[],
  categoryId: string,
  color: TodoItemBgColorValue | undefined,
): TodoCategory[] =>
  categories.map((category) =>
    category.id === categoryId ? { ...category, color } : category,
  );

/**
 * カテゴリを削除する。このカテゴリを参照しているTodoアイテムの categoryId は
 * そのまま残す（一括書き換えはしない。表示側で参照先が見つからない場合は
 * 未分類として扱う）。
 */
export const removeTodoCategory = (
  categories: TodoCategory[],
  categoryId: string,
): TodoCategory[] =>
  categories.filter((category) => category.id !== categoryId);

/**
 * カテゴリをfromIndexからtoIndexへ移動する。
 * カテゴリには親子関係のようなブロック構造がないため、単純な配列移動でよい
 * （Todoアイテムの並び替え(todoListItemReorderAction.ts)とは異なりセクション
 * 判定は不要。カテゴリ同士は常に同じ「カテゴリ一覧」という1つの集合であり、
 * 自由に並び替えられる）。実際の移動はdnd-kitのarrayMoveに委譲する
 * （src/features/routine/pages/draggableRoutineListHelpers.tsと同じ方針で、
 * fromIndex/toIndexのsplice処理を自前で持たない）。
 * 範囲外のインデックス、またはfromIndexとtoIndexが同じ場合は何もせず、
 * 同じ配列参照を返す。
 */
export const reorderTodoCategories = (
  categories: TodoCategory[],
  fromIndex: number,
  toIndex: number,
): TodoCategory[] => {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= categories.length ||
    toIndex >= categories.length ||
    fromIndex === toIndex
  ) {
    return categories;
  }

  return arrayMove(categories, fromIndex, toIndex);
};
