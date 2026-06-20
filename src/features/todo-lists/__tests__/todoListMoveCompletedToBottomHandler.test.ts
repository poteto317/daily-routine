import { createMoveCompletedToBottomToggleHandler } from "../todoListMoveCompletedToBottomHandler";

describe("createMoveCompletedToBottomToggleHandler", () => {
  it("false を true にトグルする", () => {
    const setState = jest.fn();
    createMoveCompletedToBottomToggleHandler(setState)();

    const updater = setState.mock.calls[0][0] as (value: boolean) => boolean;
    expect(updater(false)).toBe(true);
  });

  it("true を false にトグルする", () => {
    const setState = jest.fn();
    createMoveCompletedToBottomToggleHandler(setState)();

    const updater = setState.mock.calls[0][0] as (value: boolean) => boolean;
    expect(updater(true)).toBe(false);
  });

  it("setState を1回だけ呼び出す", () => {
    const setState = jest.fn();
    createMoveCompletedToBottomToggleHandler(setState)();

    expect(setState).toHaveBeenCalledTimes(1);
  });

  it("ハンドラを複数回呼ぶたびに setState を呼ぶ", () => {
    const setState = jest.fn();
    const handler = createMoveCompletedToBottomToggleHandler(setState);

    handler();
    handler();
    handler();

    expect(setState).toHaveBeenCalledTimes(3);
  });

  it("updater は純粋関数で副作用がない", () => {
    const setState = jest.fn();
    createMoveCompletedToBottomToggleHandler(setState)();

    const updater = setState.mock.calls[0][0] as (value: boolean) => boolean;

    expect(updater(false)).toBe(true);
    expect(updater(false)).toBe(true);
    expect(updater(true)).toBe(false);
    expect(updater(true)).toBe(false);
  });
});
