import { act, renderHook } from "@testing-library/react";
import { useHomePopStateRefValues } from "../useHomePopStateRefValues";

describe("useHomePopStateRefValues", () => {
  it("初期 callback refs を保持し、ref 値は直接更新できる", () => {
    const closeFormAction = jest.fn();
    const setCurrentPageAction = jest.fn();

    const { result } = renderHook(() =>
      useHomePopStateRefValues({
        showForm: false,
        closeFormAction,
        setCurrentPageAction,
      }),
    );

    expect(result.current.showFormRef.current).toBe(false);
    expect(result.current.closeFormActionRef.current).toBe(closeFormAction);
    expect(result.current.setCurrentPageActionRef.current).toBe(
      setCurrentPageAction,
    );

    const nextCloseFormAction = jest.fn();
    const nextSetCurrentPageAction = jest.fn();

    act(() => {
      result.current.showFormRef.current = true;
      result.current.closeFormActionRef.current = nextCloseFormAction;
      result.current.setCurrentPageActionRef.current = nextSetCurrentPageAction;
    });

    expect(result.current.showFormRef.current).toBe(true);
    expect(result.current.closeFormActionRef.current).toBe(nextCloseFormAction);
    expect(result.current.setCurrentPageActionRef.current).toBe(
      nextSetCurrentPageAction,
    );
  });
});
