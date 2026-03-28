import { useCallback } from "react";

type Params = {
  handleStart: (clientX: number) => void;
  handleMove: (clientX: number) => void;
  handleEnd: () => void;
};

export const useSwipePointerHandlers = ({
  handleStart,
  handleMove,
  handleEnd,
}: Params) => {
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleStart(e.touches[0].clientX);
    },
    [handleStart],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      handleMove(e.touches[0].clientX);
    },
    [handleMove],
  );

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handleStart(e.clientX);
    },
    [handleStart],
  );

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
  };
};
