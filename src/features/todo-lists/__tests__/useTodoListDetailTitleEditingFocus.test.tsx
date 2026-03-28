import type { RefObject } from "react";
import { renderHook } from "@testing-library/react";
import { useTodoListDetailTitleEditingFocus } from "../useTodoListDetailTitleEditingFocus";

describe("useTodoListDetailTitleEditingFocus", () => {
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

  it("編集中だけ入力へ focus する", () => {
    const focus = jest.fn();
    const listTitleInputRef = createInputRef(focus);

    renderHook(() =>
      useTodoListDetailTitleEditingFocus({
        editingListTitle: true,
        listTitleInputRef,
      }),
    );

    jest.runOnlyPendingTimers();

    expect(focus).toHaveBeenCalledTimes(1);
  });

  it("非編集中は focus しない", () => {
    const focus = jest.fn();
    const listTitleInputRef = createInputRef(focus);

    renderHook(() =>
      useTodoListDetailTitleEditingFocus({
        editingListTitle: false,
        listTitleInputRef,
      }),
    );

    jest.runOnlyPendingTimers();

    expect(focus).not.toHaveBeenCalled();
  });
});
