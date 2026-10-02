import { handleMenuItemNavigationKey } from "../handleMenuItemNavigationKey";
import { type KeyboardEvent } from "react";

describe("handleMenuItemNavigationKey", () => {
  const createKeyEvent = (key: string, shiftKey = false) => {
    return {
      key,
      shiftKey,
      preventDefault: jest.fn(),
    } as unknown as KeyboardEvent<HTMLButtonElement>;
  };

  it("Tabキーで次のインデックスにフォーカスする", () => {
    const event = createKeyEvent("Tab", false);
    const focusAtIndex = jest.fn();

    handleMenuItemNavigationKey({
      event,
      currentIndex: 2,
      focusAtIndex,
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(focusAtIndex).toHaveBeenCalledWith(3);
  });

  it("Shift+Tabキーで前のインデックスにフォーカスする", () => {
    const event = createKeyEvent("Tab", true);
    const focusAtIndex = jest.fn();

    handleMenuItemNavigationKey({
      event,
      currentIndex: 2,
      focusAtIndex,
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(focusAtIndex).toHaveBeenCalledWith(1);
  });

  it("ArrowDownキーで次のインデックスにフォーカスする", () => {
    const event = createKeyEvent("ArrowDown");
    const focusAtIndex = jest.fn();

    handleMenuItemNavigationKey({
      event,
      currentIndex: 1,
      focusAtIndex,
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(focusAtIndex).toHaveBeenCalledWith(2);
  });

  it("ArrowUpキーで前のインデックスにフォーカスする", () => {
    const event = createKeyEvent("ArrowUp");
    const focusAtIndex = jest.fn();

    handleMenuItemNavigationKey({
      event,
      currentIndex: 3,
      focusAtIndex,
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(focusAtIndex).toHaveBeenCalledWith(2);
  });

  it("Homeキーで先頭インデックス(0)にフォーカスする", () => {
    const event = createKeyEvent("Home");
    const focusAtIndex = jest.fn();

    handleMenuItemNavigationKey({
      event,
      currentIndex: 4,
      focusAtIndex,
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(focusAtIndex).toHaveBeenCalledWith(0);
  });

  it("Endキーで末尾インデックス(MAX_SAFE_INTEGER)にフォーカスする", () => {
    const event = createKeyEvent("End");
    const focusAtIndex = jest.fn();

    handleMenuItemNavigationKey({
      event,
      currentIndex: 1,
      focusAtIndex,
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(focusAtIndex).toHaveBeenCalledWith(Number.MAX_SAFE_INTEGER);
  });

  it("関係のないキー（Enterや文字キー等）の場合は何もしない", () => {
    const event = createKeyEvent("Enter");
    const focusAtIndex = jest.fn();

    handleMenuItemNavigationKey({
      event,
      currentIndex: 1,
      focusAtIndex,
    });

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(focusAtIndex).not.toHaveBeenCalled();
  });
});
