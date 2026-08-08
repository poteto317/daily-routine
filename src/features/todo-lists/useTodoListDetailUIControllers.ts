import { useColorPickerController } from "./useColorPickerController";
import { useItemActionMenuController } from "./useItemActionMenuController";

/**
 * カラーピッカーとアクションメニューの開閉状態をまとめる合成フック。
 */
export const useTodoListDetailUIControllers = () => {
  const colorPicker = useColorPickerController();
  const itemMenu = useItemActionMenuController();

  return {
    colorPicker,
    itemMenu,
  };
};
