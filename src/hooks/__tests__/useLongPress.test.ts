import { act, renderHook } from "@testing-library/react";
import { useLongPress } from "../useLongPress";

type PointerEventLike = { clientX: number; clientY: number; pointerType: string };

const pointerEvent = (x = 0, y = 0, pointerType = "touch"): PointerEventLike => ({
  clientX: x,
  clientY: y,
  pointerType,
});

describe("useLongPress", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("閾値未満でpointerUpするとonClickが呼ばれ、onLongPressは呼ばれない", () => {
    const onLongPress = jest.fn();
    const onClick = jest.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, onClick, delay: 500 }));

    act(() => {
      result.current.onPointerDown(pointerEvent() as never);
    });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    act(() => {
      result.current.onPointerUp();
    });
    act(() => {
      result.current.onClick();
    });

    expect(onLongPress).not.toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("閾値経過するとonLongPressが呼ばれ、その後のclickは無視される", () => {
    const onLongPress = jest.fn();
    const onClick = jest.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, onClick, delay: 500 }));

    act(() => {
      result.current.onPointerDown(pointerEvent() as never);
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(onLongPress).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.onPointerUp();
    });
    act(() => {
      result.current.onClick();
    });

    expect(onClick).not.toHaveBeenCalled();
  });

  it("閾値到達前にmoveToleranceを超えて移動するとキャンセルされ、pointerUpで通常クリックになる", () => {
    const onLongPress = jest.fn();
    const onClick = jest.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, onClick, delay: 500, moveTolerance: 10 }),
    );

    act(() => {
      result.current.onPointerDown(pointerEvent(0, 0) as never);
    });
    act(() => {
      result.current.onPointerMove(pointerEvent(20, 0) as never);
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(onLongPress).not.toHaveBeenCalled();

    act(() => {
      result.current.onPointerUp();
    });
    act(() => {
      result.current.onClick();
    });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("moveTolerance以内の移動ではキャンセルされない", () => {
    const onLongPress = jest.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, delay: 500, moveTolerance: 10 }));

    act(() => {
      result.current.onPointerDown(pointerEvent(0, 0) as never);
    });
    act(() => {
      result.current.onPointerMove(pointerEvent(5, 5) as never);
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it("onPointerLeaveでタイマーがクリアされ、onLongPressは発火しない", () => {
    const onLongPress = jest.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, delay: 500 }));

    act(() => {
      result.current.onPointerDown(pointerEvent() as never);
    });
    act(() => {
      result.current.onPointerLeave();
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it("onPointerCancelでタイマーがクリアされ、onLongPressは発火しない", () => {
    const onLongPress = jest.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, delay: 500 }));

    act(() => {
      result.current.onPointerDown(pointerEvent() as never);
    });
    act(() => {
      result.current.onPointerCancel();
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it("touch由来の押下後のonContextMenuはデフォルトの挙動を抑止する（モバイルのコールアウトメニュー抑止）", () => {
    const onLongPress = jest.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, delay: 500 }));
    const preventDefault = jest.fn();

    act(() => {
      result.current.onPointerDown(pointerEvent(0, 0, "touch") as never);
    });
    // タイマー成立前でも、touch由来であれば抑止する
    // （ネイティブの長押しジェスチャー認識とJSタイマーの発火順序は保証されないため、
    //   タイマー成立の有無ではなくpointerTypeで判定する）。
    act(() => {
      result.current.onContextMenu({ preventDefault } as never);
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it("pen由来の押下後のonContextMenuも抑止する", () => {
    const onLongPress = jest.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, delay: 500 }));
    const preventDefault = jest.fn();

    act(() => {
      result.current.onPointerDown(pointerEvent(0, 0, "pen") as never);
    });
    act(() => {
      result.current.onContextMenu({ preventDefault } as never);
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it("mouse由来の押下後のonContextMenuは抑止しない（デスクトップの右クリックメニューを妨げない）", () => {
    const onLongPress = jest.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, delay: 500 }));
    const preventDefault = jest.fn();

    act(() => {
      result.current.onPointerDown(pointerEvent(0, 0, "mouse") as never);
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    act(() => {
      result.current.onContextMenu({ preventDefault } as never);
    });

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("一度もpointerDownしていない状態のonContextMenuは抑止しない（安全なデフォルト）", () => {
    const onLongPress = jest.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, delay: 500 }));
    const preventDefault = jest.fn();

    act(() => {
      result.current.onContextMenu({ preventDefault } as never);
    });

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("onClickが渡されていなくてもエラーにならない", () => {
    const onLongPress = jest.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, delay: 500 }));

    act(() => {
      result.current.onPointerDown(pointerEvent() as never);
    });
    act(() => {
      result.current.onPointerUp();
    });

    expect(() => {
      act(() => {
        result.current.onClick();
      });
    }).not.toThrow();
  });

  describe("disabled", () => {
    it("押下中にdisabledになると保留中のタイマーがキャンセルされ、onLongPressは発火しない", () => {
      const onLongPress = jest.fn();
      const { result, rerender } = renderHook(
        ({ disabled }: { disabled: boolean }) => useLongPress({ onLongPress, delay: 500, disabled }),
        { initialProps: { disabled: false } },
      );

      act(() => {
        result.current.onPointerDown(pointerEvent() as never);
      });
      act(() => {
        jest.advanceTimersByTime(200);
      });

      rerender({ disabled: true });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(onLongPress).not.toHaveBeenCalled();
    });

    it("disabled=trueの間はpointerDownしてもタイマーが開始されない", () => {
      const onLongPress = jest.fn();
      const { result } = renderHook(() =>
        useLongPress({ onLongPress, delay: 500, disabled: true }),
      );

      act(() => {
        result.current.onPointerDown(pointerEvent() as never);
      });
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(onLongPress).not.toHaveBeenCalled();
    });

    it("disabledがfalseに戻れば通常どおり長押しが機能する", () => {
      const onLongPress = jest.fn();
      const { result, rerender } = renderHook(
        ({ disabled }: { disabled: boolean }) => useLongPress({ onLongPress, delay: 500, disabled }),
        { initialProps: { disabled: true } },
      );

      rerender({ disabled: false });

      act(() => {
        result.current.onPointerDown(pointerEvent() as never);
      });
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(onLongPress).toHaveBeenCalledTimes(1);
    });
  });

  describe("アンマウント", () => {
    it("押下中にアンマウントされるとタイマーがクリアされ、onLongPressは発火しない", () => {
      const onLongPress = jest.fn();
      const { result, unmount } = renderHook(() => useLongPress({ onLongPress, delay: 500 }));

      act(() => {
        result.current.onPointerDown(pointerEvent() as never);
      });
      act(() => {
        jest.advanceTimersByTime(200);
      });

      unmount();

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(onLongPress).not.toHaveBeenCalled();
    });
  });
});
