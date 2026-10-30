import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import { useFormOpenAutoFocus } from "../useFormOpenAutoFocus";

const createInputRef = () => {
  const inputRef = createRef<HTMLInputElement>();
  const inputElement = document.createElement("input");
  (inputRef as { current: HTMLInputElement | null }).current = inputElement;
  const focusSpy = jest.spyOn(inputElement, "focus");
  return { inputRef, focusSpy };
};

describe("useFormOpenAutoFocus", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("showForm が true のとき 50ms 後に入力欄へフォーカスする", () => {
    const { inputRef, focusSpy } = createInputRef();

    renderHook(() => useFormOpenAutoFocus({ inputRef, showForm: true }));

    jest.advanceTimersByTime(49);
    expect(focusSpy).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(focusSpy).toHaveBeenCalledTimes(1);
  });

  it("showForm が false のときはフォーカスしない", () => {
    const { inputRef, focusSpy } = createInputRef();

    renderHook(() => useFormOpenAutoFocus({ inputRef, showForm: false }));

    jest.advanceTimersByTime(50);

    expect(focusSpy).not.toHaveBeenCalled();
  });

  it("タイマー発火前にアンマウントされた場合は clearTimeout してフォーカスしない", () => {
    const { inputRef, focusSpy } = createInputRef();
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

    const { unmount } = renderHook(() =>
      useFormOpenAutoFocus({ inputRef, showForm: true }),
    );

    unmount();
    jest.advanceTimersByTime(50);

    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(focusSpy).not.toHaveBeenCalled();
  });

  it("タイマー発火前に showForm が false へ変わった場合は古いタイマーをクリアする", () => {
    const { inputRef, focusSpy } = createInputRef();
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

    const { rerender } = renderHook(
      ({ showForm }) => useFormOpenAutoFocus({ inputRef, showForm }),
      { initialProps: { showForm: true } },
    );

    rerender({ showForm: false });
    jest.advanceTimersByTime(50);

    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(focusSpy).not.toHaveBeenCalled();
  });

  it("閉じてから開き直すと再度フォーカスする", () => {
    const { inputRef, focusSpy } = createInputRef();

    const { rerender } = renderHook(
      ({ showForm }) => useFormOpenAutoFocus({ inputRef, showForm }),
      { initialProps: { showForm: true } },
    );
    jest.advanceTimersByTime(50);
    expect(focusSpy).toHaveBeenCalledTimes(1);

    rerender({ showForm: false });
    jest.advanceTimersByTime(50);
    expect(focusSpy).toHaveBeenCalledTimes(1);

    rerender({ showForm: true });
    jest.advanceTimersByTime(50);
    expect(focusSpy).toHaveBeenCalledTimes(2);
  });
});
