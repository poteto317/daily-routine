import { useMemo } from "react";
import { getSettings } from "@/features/settings";
import { sortTodoListsByMenuOrder } from "./todoListManagementOrder";
import type { TodoList } from "./types";

type UseTodoListManagementOrderParams = {
  lists: TodoList[];
};

/**
 * Todoリスト管理ページの表示順（ハンバーガーメニューと同じ並び順）を導出する。
 * CRUD状態管理（useTodoListManagementDataState.ts）とは責務を分離し、
 * 「設定のmenuOrderを読み取って並び替える」という関心事のみを持つ。
 * ストレージの生の並び順（作成順）自体は変更しない、表示専用の並び替え。
 *
 * 依存配列は意図的に`[lists]`のみとし、`menuOrder`は含めない。
 * `getSettings()`は呼び出すたびに新しい配列を返すため、これを依存に含めると
 * 参照が毎回変わり、実質的にメモ化が効かなくなってしまう
 * （`useMenuOrderState.ts`・`headerMenuItemData.ts`など、このコードベースの
 * 他のgetSettings()利用箇所も同様に「マウント時/依存変更時に読み直す」方針で
 * 統一しており、設定変更を即座に反映する必要がある場合はページ遷移
 * （コンポーネントの再マウント）を通じて`lists`自体が読み直されることで
 * 対応している）。
 */
export const useTodoListManagementOrder = ({
  lists,
}: UseTodoListManagementOrderParams): TodoList[] => {
  return useMemo(
    () => sortTodoListsByMenuOrder(lists, getSettings().menuOrder ?? []),
    [lists],
  );
};
