import { useState } from "react";
import { getSettings, saveMenuOrder } from "@/features/settings";
import { reorderTodoListsInMenuOrder } from "./todoListManagementReorder";
import type { TodoList } from "./types";

type UseTodoListManagementMenuOrderParams = {
  /** 並べ替える前の生の配列（非表示を含む全件） */
  lists: TodoList[];
};

/**
 * Todoリスト管理画面の並び順（設定の menuOrder）を state に持ち、
 * ドラッグでの並び替えを menuOrder に保存する。
 * menuOrder は画面を開いたときに 1 回だけ読む（管理画面は開くたびに作り直される）。
 */
export const useTodoListManagementMenuOrder = ({
  lists,
}: UseTodoListManagementMenuOrderParams) => {
  const [menuOrder, setMenuOrder] = useState<string[]>(
    () => getSettings().menuOrder ?? [],
  );

  const handleReorderLists = (activeListId: string, overListId: string) => {
    const nextMenuOrder = reorderTodoListsInMenuOrder({
      lists,
      menuOrder,
      activeListId,
      overListId,
    });
    if (!nextMenuOrder) return;

    setMenuOrder(nextMenuOrder);
    saveMenuOrder(nextMenuOrder);
  };

  return { menuOrder, handleReorderLists };
};
