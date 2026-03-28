import { act, renderHook } from "@testing-library/react";

jest.mock("@/features/settings/storage", () => ({
  getSettings: jest.fn(() => ({
    menuOrder: ["weather", "journal"],
  })),
}));

jest.mock("../state/menuOrderStateResult", () => ({
  createMenuOrderStateResult: jest.fn(),
}));

import { getSettings } from "@/features/settings/storage";
import { createMenuOrderStateResult } from "../state/menuOrderStateResult";
import { useMenuOrderState } from "../state/useMenuOrderState";

describe("useMenuOrderState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createMenuOrderStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("初期 state を storage から作り更新できる", () => {
    const { result } = renderHook(() => useMenuOrderState());

    expect(getSettings).toHaveBeenCalled();
    expect(createMenuOrderStateResult).toHaveBeenCalledWith({
      menuOrder: ["weather", "journal"],
      setMenuOrder: expect.any(Function),
    });
    expect(result.current.menuOrder).toEqual(["weather", "journal"]);

    act(() => {
      result.current.setMenuOrder(["budget", "meal"]);
    });

    expect(result.current.menuOrder).toEqual(["budget", "meal"]);
    expect(createMenuOrderStateResult).toHaveBeenLastCalledWith({
      menuOrder: ["budget", "meal"],
      setMenuOrder: expect.any(Function),
    });
  });
});
