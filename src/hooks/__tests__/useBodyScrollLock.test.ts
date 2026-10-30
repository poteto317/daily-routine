import { renderHook } from "@testing-library/react";
import { useBodyScrollLock } from "../useBodyScrollLock";

describe("useBodyScrollLock", () => {
  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("ロック中は body のスクロールを止める", () => {
    renderHook(() => useBodyScrollLock(true));

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("ロックしないときは overflow を空に戻す", () => {
    document.body.style.overflow = "hidden";

    renderHook(() => useBodyScrollLock(false));

    expect(document.body.style.overflow).toBe("");
  });

  it("ロックを解除するとスクロールを戻す", () => {
    const { rerender } = renderHook(
      ({ isLocked }) => useBodyScrollLock(isLocked),
      { initialProps: { isLocked: true } },
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender({ isLocked: false });

    expect(document.body.style.overflow).toBe("");
  });

  it("アンマウント時にスクロールを戻す（メニューを開いたまま画面遷移した場合）", () => {
    const { unmount } = renderHook(() => useBodyScrollLock(true));

    unmount();

    expect(document.body.style.overflow).toBe("");
  });
});
