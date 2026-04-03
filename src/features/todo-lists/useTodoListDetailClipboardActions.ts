import { useCallback } from "react";
import type { TodoListItem } from "./types";
import type { SetClipboardItems } from "./useTodoListDetailClipboardState";

type UseTodoListDetailClipboardActionsParams = {
  setClipboardItems: SetClipboardItems;
};

/**
 * クリップボード操作のアクションを提供するhook
 * 責務: setClipboard と clearClipboard のみ
 */
export const useTodoListDetailClipboardActions = ({
  setClipboardItems,
}: UseTodoListDetailClipboardActionsParams) => {
  // setClipboardItems は Dispatch<SetStateAction<...>> のため updater 関数も受け付けるが、
  // setClipboard は配列のみを受け付ける公開 API として型を制限する
  const setClipboard = useCallback(
    (items: TodoListItem[]) => setClipboardItems(items),
    [setClipboardItems],
  );

  const clearClipboard = useCallback(
    () => setClipboardItems([]),
    [setClipboardItems],
  );

  return { setClipboard, clearClipboard };
};
