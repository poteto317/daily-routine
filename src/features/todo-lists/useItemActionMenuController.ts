import { useCallback, useState } from "react";
import { useCloseOnOutsideInteraction } from "./useCloseOnOutsideInteraction";

/**
 * Todoアイテムのアクションメニュー（⋮）の開閉状態を管理するフック。
 * どのアイテムのメニューが開いているかを itemMenuItemId で管理する。
 * メニュー外タップ・Escキーでの自動クローズは useCloseOnOutsideInteraction に委譲する。
 */
export const useItemActionMenuController = () => {
  const [itemMenuItemId, setItemMenuItemId] = useState<string | null>(null);

  const toggleItemMenu = useCallback((itemId: string) => {
    setItemMenuItemId((prev) => (prev === itemId ? null : itemId));
  }, []);

  const closeItemMenu = useCallback(() => {
    setItemMenuItemId(null);
  }, []);

  useCloseOnOutsideInteraction({
    isActive: itemMenuItemId !== null,
    selector: "[data-item-menu]",
    onClose: closeItemMenu,
    includeTouch: true,
  });

  return {
    itemMenuItemId,
    toggleItemMenu,
    closeItemMenu,
  };
};
