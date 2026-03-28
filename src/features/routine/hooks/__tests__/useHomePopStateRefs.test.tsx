import { renderHook } from "@testing-library/react";

jest.mock("../useHomePopStateRefValues", () => ({
  useHomePopStateRefValues: jest.fn(),
}));

jest.mock("../useHomePopStateRefSync", () => ({
  useHomePopStateRefSync: jest.fn(),
}));

import { useHomePopStateRefSync } from "../useHomePopStateRefSync";
import { useHomePopStateRefValues } from "../useHomePopStateRefValues";
import { useHomePopStateRefs } from "../useHomePopStateRefs";

describe("useHomePopStateRefs", () => {
  it("ref values hook の戻り値を返し、sync hook に橋渡しする", () => {
    const closeFormAction = jest.fn();
    const setCurrentPageAction = jest.fn();
    const refs = {
      showFormRef: { current: false },
      closeFormActionRef: { current: closeFormAction },
      setCurrentPageActionRef: { current: setCurrentPageAction },
    };

    (useHomePopStateRefValues as jest.Mock).mockReturnValue(refs);

    const { result } = renderHook(() =>
      useHomePopStateRefs({
        showForm: false,
        closeFormAction,
        setCurrentPageAction,
      }),
    );

    expect(result.current).toBe(refs);
    expect(useHomePopStateRefValues).toHaveBeenCalledWith({
      showForm: false,
      closeFormAction,
      setCurrentPageAction,
    });
    expect(useHomePopStateRefSync).toHaveBeenCalledWith({
      showForm: false,
      closeFormAction,
      setCurrentPageAction,
      refs,
    });
  });
});
