import { useCallback, useEffect, useState } from "react";

/**
 * カラーピッカーの開閉状態を管理するフック。
 * - アイテム個別のカラーピッカー（colorPickerItemId）
 * - 一括カラーピッカー（showBulkColorPicker）
 * - カラーピッカー外クリック・Escキーによる自動クローズ
 * - アイテムピッカーと一括ピッカーの排他制御
 */
export const useColorPickerController = () => {
  const [colorPickerItemId, setColorPickerItemId] = useState<string | null>(
    null,
  );
  const [showBulkColorPicker, setShowBulkColorPicker] = useState(false);

  /**
   * アイテム個別のカラーピッカーをトグルする。
   * 一括ピッカーが開いている場合は閉じる。
   * 同じアイテムIDで呼ぶと閉じる（トグル動作）。
   */
  const toggleItemColorPicker = useCallback((itemId: string) => {
    setShowBulkColorPicker(false);
    setColorPickerItemId((prev) => (prev === itemId ? null : itemId));
  }, []);

  /** アイテム個別カラーピッカーを閉じる */
  const closeItemColorPicker = useCallback(() => {
    setColorPickerItemId(null);
  }, []);

  /**
   * 一括カラーピッカーをトグルする。
   * アイテムピッカーが開いている場合は閉じる。
   */
  const toggleBulkColorPicker = useCallback(() => {
    setColorPickerItemId(null);
    setShowBulkColorPicker((v) => !v);
  }, []);

  /** 一括カラーピッカーを閉じる */
  const closeBulkColorPicker = useCallback(() => {
    setShowBulkColorPicker(false);
  }, []);

  const isAnyOpen = colorPickerItemId !== null || showBulkColorPicker;

  useEffect(() => {
    if (!isAnyOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (
        !(e.target instanceof Element) ||
        !e.target.closest("[data-color-picker]")
      ) {
        setColorPickerItemId(null);
        setShowBulkColorPicker(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setColorPickerItemId(null);
        setShowBulkColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAnyOpen]);

  return {
    colorPickerItemId,
    showBulkColorPicker,
    toggleItemColorPicker,
    closeItemColorPicker,
    toggleBulkColorPicker,
    closeBulkColorPicker,
  };
};
