import { useCallback, useState } from "react";
import { useCloseOnOutsideInteraction } from "./useCloseOnOutsideInteraction";

/**
 * カラーピッカーの開閉状態を管理するフック。
 * - アイテム個別のカラーピッカー（colorPickerItemId）
 * - 一括カラーピッカー（showBulkColorPicker）
 * - アイテムピッカーと一括ピッカーの排他制御
 * カラーピッカー外クリック・Escキーでの自動クローズは useCloseOnOutsideInteraction に委譲する。
 *
 * NOTE: アクションメニュー統一（TodoItemActionMenu）以降、アイテム個別の
 * 背景色スウォッチはメニュー内に常時表示となり、colorPickerItemId /
 * toggleItemColorPicker / closeItemColorPicker を呼び出す経路は無くなった。
 * showBulkColorPicker（ツールバーの一括カラーピッカー）が同じフック内で
 * 現役のため、フックごと削除せず意図的にそのまま残している。
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

  /** アイテム個別・一括の両方を閉じる（外側クリック/Esc用） */
  const closeAllColorPickers = useCallback(() => {
    setColorPickerItemId(null);
    setShowBulkColorPicker(false);
  }, []);

  const isAnyOpen = colorPickerItemId !== null || showBulkColorPicker;

  useCloseOnOutsideInteraction({
    isActive: isAnyOpen,
    selector: "[data-color-picker]",
    onClose: closeAllColorPickers,
  });

  return {
    colorPickerItemId,
    showBulkColorPicker,
    toggleItemColorPicker,
    closeItemColorPicker,
    toggleBulkColorPicker,
    closeBulkColorPicker,
  };
};
