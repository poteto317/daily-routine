import { useCallback, useState } from "react";

type UseTodoListInlineInsertParams = {
  listId: string;
  onAddItem: (listId: string, title: string, insertAfterIndex?: number) => void;
};

/**
 * インライン挿入フォームのステートとロジックを管理するフック。
 * - どのアイテムの直後に挿入するかの選択状態
 * - 入力テキストの管理
 * - 挿入の実行・キャンセル
 */
export const useTodoListInlineInsert = ({
  listId,
  onAddItem,
}: UseTodoListInlineInsertParams) => {
  const [insertAfterId, setInsertAfterId] = useState<string | null>(null);
  const [inlineInputText, setInlineInputText] = useState("");

  const openInlineInsert = useCallback((itemId: string) => {
    setInsertAfterId((prev) => (prev === itemId ? null : itemId));
    setInlineInputText("");
  }, []);

  const closeInlineInsert = useCallback(() => {
    setInsertAfterId(null);
    setInlineInputText("");
  }, []);

  const handleInlineAdd = useCallback(
    (insertAfterOrigIndex: number) => {
      const normalized = inlineInputText.trim();
      if (!normalized) return;
      onAddItem(listId, normalized, insertAfterOrigIndex);
      setInsertAfterId(null);
      setInlineInputText("");
    },
    [inlineInputText, listId, onAddItem],
  );

  return {
    insertAfterId,
    inlineInputText,
    setInlineInputText,
    openInlineInsert,
    closeInlineInsert,
    handleInlineAdd,
  };
};
