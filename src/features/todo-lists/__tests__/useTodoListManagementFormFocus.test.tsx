import type { RefObject } from "react";
import { renderHook } from "@testing-library/react";
import { useTodoListManagementFormFocus } from "../useTodoListManagementFormFocus";

describe("useTodoListManagementFormFocus", () => {
  const createInputRef = (focus: jest.Mock) =>
    ({
      current: { focus },
    }) as unknown as RefObject<HTMLInputElement | null>;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("フォーム表示時だけ入力へ focus する", () => {
    const focus = jest.fn();
    const inputRef = createInputRef(focus);

    renderHook(() =>
      useTodoListManagementFormFocus({
        inputRef,
        showForm: true,
      }),
    );

    jest.runOnlyPendingTimers();

    expect(focus).toHaveBeenCalledTimes(1);
  });

  it("フォーム非表示時は focus しない", () => {
    const focus = jest.fn();
    const inputRef = createInputRef(focus);

    renderHook(() =>
      useTodoListManagementFormFocus({
        inputRef,
        showForm: false,
      }),
    );

    jest.runOnlyPendingTimers();

    expect(focus).not.toHaveBeenCalled();
  });
});
