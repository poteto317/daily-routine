import { useCallback, useState } from "react";
import { useSwipePointerHandlers } from "./useSwipePointerHandlers";
import { useSwipeWindowEvents } from "./useSwipeWindowEvents";

type Params = {
  isEditMode: boolean;
  onSwipeAction: () => void;
};

const SWIPE_THRESHOLD = 100;
const MAX_TRANSLATE = 120;

export const useSwipeGesture = ({
  isEditMode,
  onSwipeAction,
}: Params) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleStart = useCallback(
    (clientX: number) => {
      if (!isEditMode) return;
      setIsDragging(true);
      setStartX(clientX);
    },
    [isEditMode],
  );

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging || !isEditMode) return;
      const deltaX = startX - clientX;
      if (deltaX > 0) {
        setTranslateX(Math.min(deltaX, MAX_TRANSLATE));
      }
    },
    [isDragging, isEditMode, startX],
  );

  const handleEnd = useCallback(() => {
    if (!isDragging || !isEditMode) return;
    setIsDragging(false);

    if (translateX >= SWIPE_THRESHOLD) {
      setTranslateX(MAX_TRANSLATE);
      setTimeout(() => {
        onSwipeAction();
        setTranslateX(0);
      }, 200);
      return;
    }

    setTranslateX(0);
  }, [isDragging, isEditMode, onSwipeAction, translateX]);

  const { handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseDown } =
    useSwipePointerHandlers({
      handleStart,
      handleMove,
      handleEnd,
    });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleMove(e.clientX);
    },
    [handleMove],
  );

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  useSwipeWindowEvents({
    isDragging,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
  });

  return {
    translateX,
    isDragging,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
  };
};
