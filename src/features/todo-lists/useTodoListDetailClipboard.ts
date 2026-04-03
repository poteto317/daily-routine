import { useTodoListDetailClipboardState } from "./useTodoListDetailClipboardState";
import { useTodoListDetailClipboardActions } from "./useTodoListDetailClipboardActions";

/**
 * クリップボード操作を集約するhook
 * 責務: clipboardState と clearClipboard アクションを組み合わせたクリップボード操作 API の提供
 */
export const useTodoListDetailClipboard = () => {
  const { clipboardItems, setClipboardItems } =
    useTodoListDetailClipboardState();

  const { setClipboard, clearClipboard } = useTodoListDetailClipboardActions({
    setClipboardItems,
  });

  return {
    clipboardItems,
    setClipboard,
    clearClipboard,
  };
};
