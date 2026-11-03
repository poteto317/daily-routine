import type { Modifier } from "@dnd-kit/core";

/**
 * 掴んだ行の移動を制限する。上下は行の中心を一覧の枠（行の親要素 = containerNodeRect）の
 * 中に、左右は行の左右の端を枠の中に収める。
 * DragOverlay を使わず行そのものを transform で動かす一覧では、自動スクロールで
 * ページが下がると行も付いて下がって文書が伸び、スクロールが際限なく続く。これを止める
 * （はみ出しは行の高さの半分までなので、ページは伸び続けない）。
 * 上下を行の端ではなく中心で止めるのは、dnd-kit が modifier を当てた後の位置で
 * closestCenter の当たり判定をするため。端で止めると、背の高い行（タイトルが折り返す行）の
 * 中心が末尾・先頭の行の位置まで届かず、末尾・先頭に置けなくなる。
 */
export const restrictToSortableListBounds: Modifier = ({
  transform,
  draggingNodeRect,
  containerNodeRect,
}) => {
  if (!draggingNodeRect || !containerNodeRect) return transform;
  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);
  const center = draggingNodeRect.top + draggingNodeRect.height / 2;
  return {
    ...transform,
    x: clamp(
      transform.x,
      containerNodeRect.left - draggingNodeRect.left,
      containerNodeRect.right - draggingNodeRect.right,
    ),
    y: clamp(
      transform.y,
      containerNodeRect.top - center,
      containerNodeRect.bottom - center,
    ),
  };
};
