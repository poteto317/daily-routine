import { act, renderHook } from "@testing-library/react";
import { useColorPickerController } from "../useColorPickerController";

describe("useColorPickerController", () => {
  it("初期状態: colorPickerItemId は null、showBulkColorPicker は false", () => {
    const { result } = renderHook(() => useColorPickerController());
    expect(result.current.colorPickerItemId).toBeNull();
    expect(result.current.showBulkColorPicker).toBe(false);
  });

  it("toggleItemColorPicker でアイテムIDをセットできる", () => {
    const { result } = renderHook(() => useColorPickerController());
    act(() => {
      result.current.toggleItemColorPicker("item-1");
    });
    expect(result.current.colorPickerItemId).toBe("item-1");
  });

  it("toggleItemColorPicker で同じIDを再度呼ぶとトグルして閉じる", () => {
    const { result } = renderHook(() => useColorPickerController());
    act(() => {
      result.current.toggleItemColorPicker("item-1");
    });
    act(() => {
      result.current.toggleItemColorPicker("item-1");
    });
    expect(result.current.colorPickerItemId).toBeNull();
  });

  it("toggleItemColorPicker を呼ぶと一括ピッカーが閉じる", () => {
    const { result } = renderHook(() => useColorPickerController());
    act(() => {
      result.current.toggleBulkColorPicker();
    });
    act(() => {
      result.current.toggleItemColorPicker("item-1");
    });
    expect(result.current.showBulkColorPicker).toBe(false);
    expect(result.current.colorPickerItemId).toBe("item-1");
  });

  it("closeItemColorPicker でアイテムピッカーを閉じる", () => {
    const { result } = renderHook(() => useColorPickerController());
    act(() => {
      result.current.toggleItemColorPicker("item-1");
    });
    act(() => {
      result.current.closeItemColorPicker();
    });
    expect(result.current.colorPickerItemId).toBeNull();
  });

  it("toggleBulkColorPicker で一括ピッカーを開ける", () => {
    const { result } = renderHook(() => useColorPickerController());
    act(() => {
      result.current.toggleBulkColorPicker();
    });
    expect(result.current.showBulkColorPicker).toBe(true);
  });

  it("toggleBulkColorPicker を呼ぶとアイテムピッカーが閉じる", () => {
    const { result } = renderHook(() => useColorPickerController());
    act(() => {
      result.current.toggleItemColorPicker("item-1");
    });
    act(() => {
      result.current.toggleBulkColorPicker();
    });
    expect(result.current.colorPickerItemId).toBeNull();
    expect(result.current.showBulkColorPicker).toBe(true);
  });

  it("closeBulkColorPicker で一括ピッカーを閉じる", () => {
    const { result } = renderHook(() => useColorPickerController());
    act(() => {
      result.current.toggleBulkColorPicker();
    });
    act(() => {
      result.current.closeBulkColorPicker();
    });
    expect(result.current.showBulkColorPicker).toBe(false);
  });

  it("Escキーで両方の状態がリセットされる", () => {
    const { result } = renderHook(() => useColorPickerController());
    act(() => {
      result.current.toggleItemColorPicker("item-1");
    });
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(result.current.colorPickerItemId).toBeNull();
    expect(result.current.showBulkColorPicker).toBe(false);
  });

  it("カラーピッカー外のmousedownで両方の状態がリセットされる", () => {
    const { result } = renderHook(() => useColorPickerController());
    act(() => {
      result.current.toggleBulkColorPicker();
    });
    act(() => {
      const outside = document.createElement("div");
      document.body.appendChild(outside);
      outside.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      document.body.removeChild(outside);
    });
    expect(result.current.showBulkColorPicker).toBe(false);
  });

  it("カラーピッカーが閉じているときはイベントリスナーを登録しない", () => {
    const addSpy = jest.spyOn(document, "addEventListener");
    renderHook(() => useColorPickerController());
    expect(addSpy).not.toHaveBeenCalled();
    addSpy.mockRestore();
  });

  it("アイテムピッカーを別のアイテムに切り替えてもリスナーの再登録が起きない", () => {
    const { result } = renderHook(() => useColorPickerController());
    act(() => {
      result.current.toggleItemColorPicker("item-1");
    });

    const addSpy = jest.spyOn(document, "addEventListener");
    act(() => {
      result.current.toggleItemColorPicker("item-2");
    });

    // ピッカーが開いたまま（isAnyOpen が変わらない）なのでリスナーの再登録は不要
    expect(addSpy).not.toHaveBeenCalled();
    addSpy.mockRestore();
  });
});
