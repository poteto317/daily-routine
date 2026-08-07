import { useEffect } from "react";

type Options = {
  isActive: boolean;
  selector: string;
  onClose: () => void;
  includeTouch?: boolean;
};

/**
 * 指定した selector の外側でのポインタ操作、または Escape キーで onClose を呼ぶ。
 * useItemActionMenuController / useColorPickerController で共通利用する。
 * onClose は呼び出し側で useCallback により安定化されている前提（依存配列に含めるため）。
 */
export const useCloseOnOutsideInteraction = ({
  isActive,
  selector,
  onClose,
  includeTouch = false,
}: Options) => {
  useEffect(() => {
    if (!isActive) return;

    const handlePointerDown = (e: Event) => {
      const target = e.target instanceof Element ? e.target : null;
      if (!target?.closest(selector)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    if (includeTouch) {
      document.addEventListener("touchstart", handlePointerDown, { passive: true });
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      if (includeTouch) {
        document.removeEventListener("touchstart", handlePointerDown);
      }
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, selector, onClose, includeTouch]);
};
