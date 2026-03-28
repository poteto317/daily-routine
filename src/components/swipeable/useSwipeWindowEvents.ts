import { useEffect } from "react";

type Params = {
  isDragging: boolean;
  onMouseMove: (e: MouseEvent) => void;
  onMouseUp: () => void;
};

export const useSwipeWindowEvents = ({
  isDragging,
  onMouseMove,
  onMouseUp,
}: Params) => {
  useEffect(() => {
    if (!isDragging) return;

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, onMouseMove, onMouseUp]);
};
