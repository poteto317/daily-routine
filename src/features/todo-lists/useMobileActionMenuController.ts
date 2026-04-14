import { useCallback, useEffect, useState } from "react";

/**
 * モバイル用アクションメニュー（⋮）の開閉状態を管理するフック。
 * - どのアイテムのメニューが開いているかを mobileMenuItemId で管理
 * - メニュー外タップ・Escキーで自動クローズ
 */
export const useMobileActionMenuController = () => {
  const [mobileMenuItemId, setMobileMenuItemId] = useState<string | null>(null);

  const toggleMobileMenu = useCallback((itemId: string) => {
    setMobileMenuItemId((prev) => (prev === itemId ? null : itemId));
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuItemId(null);
  }, []);

  useEffect(() => {
    if (mobileMenuItemId === null) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      if (!target?.closest("[data-mobile-menu]")) {
        setMobileMenuItemId(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuItemId(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuItemId]);

  return {
    mobileMenuItemId,
    toggleMobileMenu,
    closeMobileMenu,
  };
};
