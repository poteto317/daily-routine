import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import { useTodoCategoryManagementFormFocus } from "../useTodoCategoryManagementFormFocus";

describe("useTodoCategoryManagementFormFocus", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("showForm が true になったら入力欄へフォーカスする", () => {
    const inputRef = createRef<HTMLInputElement>();
    const inputElement = document.createElement("input");
    (inputRef as { current: HTMLInputElement | null }).current = inputElement;
    const focusSpy = jest.spyOn(inputElement, "focus");

    renderHook(() =>
      useTodoCategoryManagementFormFocus({ inputRef, showForm: true }),
    );

    jest.advanceTimersByTime(50);

    expect(focusSpy).toHaveBeenCalled();
  });

  it("showForm が false のときはフォーカスしない", () => {
    const inputRef = createRef<HTMLInputElement>();
    const inputElement = document.createElement("input");
    (inputRef as { current: HTMLInputElement | null }).current = inputElement;
    const focusSpy = jest.spyOn(inputElement, "focus");

    renderHook(() =>
      useTodoCategoryManagementFormFocus({ inputRef, showForm: false }),
    );

    jest.advanceTimersByTime(50);

    expect(focusSpy).not.toHaveBeenCalled();
  });

  it("タイマー発火前にアンマウントされた場合はフォーカスしない（クリーンアップされる）", () => {
    const inputRef = createRef<HTMLInputElement>();
    const inputElement = document.createElement("input");
    (inputRef as { current: HTMLInputElement | null }).current = inputElement;
    const focusSpy = jest.spyOn(inputElement, "focus");
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

    const { unmount } = renderHook(() =>
      useTodoCategoryManagementFormFocus({ inputRef, showForm: true }),
    );

    unmount();
    jest.advanceTimersByTime(50);

    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(focusSpy).not.toHaveBeenCalled();
  });

  it("タイマー発火前にshowFormがfalseへ変わった場合は古いタイマーをクリアする", () => {
    const inputRef = createRef<HTMLInputElement>();
    const inputElement = document.createElement("input");
    (inputRef as { current: HTMLInputElement | null }).current = inputElement;
    const focusSpy = jest.spyOn(inputElement, "focus");

    const { rerender } = renderHook(
      ({ showForm }) =>
        useTodoCategoryManagementFormFocus({ inputRef, showForm }),
      { initialProps: { showForm: true } },
    );

    rerender({ showForm: false });
    jest.advanceTimersByTime(50);

    expect(focusSpy).not.toHaveBeenCalled();
  });
});
