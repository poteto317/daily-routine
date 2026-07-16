import { useCallback } from "react";
import { useColorPickerController } from "./useColorPickerController";
import { useCategoryPickerController } from "./useCategoryPickerController";
import { useMobileActionMenuController } from "./useMobileActionMenuController";

/**
 * 背景色ピッカーとカテゴリピッカーは同一アイテム上で同時に開くと重なって
 * 表示されるため、一方を開くときはもう一方を閉じる（排他制御）。
 * 各コントローラー自体の実装（外側クリック/Esc閉じなど）には手を入れず、
 * この合成層でのみ相互排他を成立させる。
 * ラッパー関数は各コントローラーのハンドラーと同様 useCallback で安定化し、
 * 参照が毎レンダー変わらないようにする。
 */
export const useTodoListDetailUIControllers = () => {
  const colorPicker = useColorPickerController();
  const categoryPicker = useCategoryPickerController();
  const mobileMenu = useMobileActionMenuController();

  const { closeItemCategoryPicker, toggleItemCategoryPicker: rawToggleItemCategoryPicker } =
    categoryPicker;
  const {
    toggleItemColorPicker: rawToggleItemColorPicker,
    toggleBulkColorPicker: rawToggleBulkColorPicker,
    closeItemColorPicker,
    closeBulkColorPicker,
  } = colorPicker;

  const toggleItemColorPicker = useCallback(
    (itemId: string) => {
      closeItemCategoryPicker();
      rawToggleItemColorPicker(itemId);
    },
    [closeItemCategoryPicker, rawToggleItemColorPicker],
  );

  const toggleBulkColorPicker = useCallback(() => {
    closeItemCategoryPicker();
    rawToggleBulkColorPicker();
  }, [closeItemCategoryPicker, rawToggleBulkColorPicker]);

  const toggleItemCategoryPicker = useCallback(
    (itemId: string) => {
      closeItemColorPicker();
      closeBulkColorPicker();
      rawToggleItemCategoryPicker(itemId);
    },
    [closeItemColorPicker, closeBulkColorPicker, rawToggleItemCategoryPicker],
  );

  return {
    colorPicker: { ...colorPicker, toggleItemColorPicker, toggleBulkColorPicker },
    categoryPicker: { ...categoryPicker, toggleItemCategoryPicker },
    mobileMenu,
  };
};
