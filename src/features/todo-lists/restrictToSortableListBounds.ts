import type { Modifier } from "@dnd-kit/core";

/**
 * 掴んだ行の移動を、一覧の枠（行の親要素 = containerNodeRect）の中に制限する。
 * DragOverlay を使わず行そのものを transform で動かす一覧では、自動スクロールで
 * ページが下がると行も付いて下がって文書が伸び、スクロールが際限なく続く。これを止める。
 */
export const restrictToSortableListBounds: Modifier = ({
  transform,
  draggingNodeRect,
  containerNodeRect,
}) => {
  if (!draggingNodeRect || !containerNodeRect) return transform;
  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);
  return {
    ...transform,
    x: clamp(
      transform.x,
      containerNodeRect.left - draggingNodeRect.left,
      containerNodeRect.right - draggingNodeRect.right,
    ),
    y: clamp(
      transform.y,
      containerNodeRect.top - draggingNodeRect.top,
      containerNodeRect.bottom - draggingNodeRect.bottom,
    ),
  };
};
