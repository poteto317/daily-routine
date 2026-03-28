import { useCallback, useRef } from "react";
import { restoreRoutineCrudScrollPosition } from "./routineCrudViewStateActions";

export const useRoutineCrudScrollRestoration = () => {
  const scrollRef = useRef(0);

  const restoreScroll = useCallback(() => {
    restoreRoutineCrudScrollPosition({
      scrollRef,
      scrollTo: window.scrollTo,
    });
  }, []);

  return {
    restoreScroll,
    scrollRef,
  };
};
