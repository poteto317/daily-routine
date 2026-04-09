import type { KeyboardEvent } from "react";

type Params = {
  event: KeyboardEvent<HTMLButtonElement>;
  currentIndex: number;
  focusAtIndex: (index: number) => void;
};

export const handleMenuItemNavigationKey = ({
  event,
  currentIndex,
  focusAtIndex,
}: Params) => {
  if (event.key === "Tab") {
    event.preventDefault();
    focusAtIndex(currentIndex + (event.shiftKey ? -1 : 1));
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    focusAtIndex(currentIndex + 1);
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    focusAtIndex(currentIndex - 1);
    return;
  }

  if (event.key === "Home") {
    event.preventDefault();
    focusAtIndex(0);
    return;
  }

  if (event.key === "End") {
    event.preventDefault();
    focusAtIndex(Number.MAX_SAFE_INTEGER);
  }
};
