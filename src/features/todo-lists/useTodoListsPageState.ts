import { useTodoListDetailClipboard } from "./useTodoListDetailClipboard";
import { useTodoListSelectionState } from "./useTodoListSelectionState";

export const useTodoListsPageState = () => {
  const { effectiveSelectedId } = useTodoListSelectionState();
  const { clipboardItems, setClipboard, clearClipboard } =
    useTodoListDetailClipboard();

  return { effectiveSelectedId, clipboardItems, setClipboard, clearClipboard };
};
