import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import { useBudgetCategoryManagementFormFocus } from "../useBudgetCategoryManagementFormFocus";

describe("useBudgetCategoryManagementFormFocus", () => {
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
      useBudgetCategoryManagementFormFocus({ inputRef, showForm: true }),
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
      useBudgetCategoryManagementFormFocus({ inputRef, showForm: false }),
    );

    jest.advanceTimersByTime(50);

    expect(focusSpy).not.toHaveBeenCalled();
  });
});
