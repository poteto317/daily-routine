import { useCallback, useEffect, useState } from "react";

/**
 * カテゴリピッカーの開閉状態を管理するフック。
 * useColorPickerController と同様のパターン（アイテム個別ピッカーの開閉、
 * ピッカー外クリック・Escキーによる自動クローズ）。
 */
export const useCategoryPickerController = () => {
  const [categoryPickerItemId, setCategoryPickerItemId] = useState<
    string | null
  >(null);

  /** 同じアイテムIDで呼ぶと閉じる（トグル動作） */
  const toggleItemCategoryPicker = useCallback((itemId: string) => {
    setCategoryPickerItemId((prev) => (prev === itemId ? null : itemId));
  }, []);

  const closeItemCategoryPicker = useCallback(() => {
    setCategoryPickerItemId(null);
  }, []);

  useEffect(() => {
    if (categoryPickerItemId === null) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (
        !(e.target instanceof Element) ||
        !e.target.closest("[data-category-picker]")
      ) {
        setCategoryPickerItemId(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCategoryPickerItemId(null);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [categoryPickerItemId]);

  return {
    categoryPickerItemId,
    toggleItemCategoryPicker,
    closeItemCategoryPicker,
  };
};
