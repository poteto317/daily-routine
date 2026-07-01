import { useColorPickerController } from "./useColorPickerController";
import { useMobileActionMenuController } from "./useMobileActionMenuController";

export const useTodoListDetailUIControllers = () => {
  const colorPicker = useColorPickerController();
  const mobileMenu = useMobileActionMenuController();
  return { colorPicker, mobileMenu };
};
