import type { KeyboardEvent as ReactKeyboardEvent } from "react";

type NativeKeyboardEventLike = {
  isComposing?: boolean;
  keyCode?: number;
  which?: number;
};

export const isImeComposingKeyDown = (
  event: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
) => {
  const nativeEvent = event.nativeEvent as NativeKeyboardEventLike;

  return (
    nativeEvent.isComposing === true ||
    nativeEvent.keyCode === 229 ||
    nativeEvent.which === 229
  );
};
