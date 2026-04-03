import type { Dispatch, SetStateAction } from "react";

export const createCollapseToggleHandler = (
  setCollapsedItemIds: Dispatch<SetStateAction<Set<string>>>,
) => {
  return (itemId: string) => {
    setCollapsedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };
};
