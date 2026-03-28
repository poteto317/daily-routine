import { act, renderHook } from "@testing-library/react";

jest.mock("../routineCrudViewStateActions", () => ({
  restoreRoutineCrudScrollPosition: jest.fn(),
}));

import { restoreRoutineCrudScrollPosition } from "../routineCrudViewStateActions";
import { useRoutineCrudScrollRestoration } from "../useRoutineCrudScrollRestoration";

describe("useRoutineCrudScrollRestoration", () => {
  it("scroll ref を保持し、restore action を window.scrollTo で委譲する", () => {
    const { result } = renderHook(() => useRoutineCrudScrollRestoration());

    act(() => {
      result.current.scrollRef.current = 240;
      result.current.restoreScroll();
    });

    expect(result.current.scrollRef.current).toBe(240);
    expect(restoreRoutineCrudScrollPosition).toHaveBeenCalledWith({
      scrollRef: result.current.scrollRef,
      scrollTo: window.scrollTo,
    });
  });
});
