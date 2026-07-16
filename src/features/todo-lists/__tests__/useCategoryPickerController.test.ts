import { act, renderHook } from "@testing-library/react";
import { useCategoryPickerController } from "../useCategoryPickerController";

describe("useCategoryPickerController", () => {
  it("初期状態: categoryPickerItemId は null", () => {
    const { result } = renderHook(() => useCategoryPickerController());
    expect(result.current.categoryPickerItemId).toBeNull();
  });

  it("toggleItemCategoryPicker でアイテムIDをセットできる", () => {
    const { result } = renderHook(() => useCategoryPickerController());
    act(() => {
      result.current.toggleItemCategoryPicker("item-1");
    });
    expect(result.current.categoryPickerItemId).toBe("item-1");
  });

  it("toggleItemCategoryPicker で同じIDを再度呼ぶとトグルして閉じる", () => {
    const { result } = renderHook(() => useCategoryPickerController());
    act(() => {
      result.current.toggleItemCategoryPicker("item-1");
    });
    act(() => {
      result.current.toggleItemCategoryPicker("item-1");
    });
    expect(result.current.categoryPickerItemId).toBeNull();
  });

  it("toggleItemCategoryPicker で別のIDを呼ぶと切り替わる", () => {
    const { result } = renderHook(() => useCategoryPickerController());
    act(() => {
      result.current.toggleItemCategoryPicker("item-1");
    });
    act(() => {
      result.current.toggleItemCategoryPicker("item-2");
    });
    expect(result.current.categoryPickerItemId).toBe("item-2");
  });

  it("closeItemCategoryPicker でピッカーを閉じる", () => {
    const { result } = renderHook(() => useCategoryPickerController());
    act(() => {
      result.current.toggleItemCategoryPicker("item-1");
    });
    act(() => {
      result.current.closeItemCategoryPicker();
    });
    expect(result.current.categoryPickerItemId).toBeNull();
  });

  it("Escキーで状態がリセットされる", () => {
    const { result } = renderHook(() => useCategoryPickerController());
    act(() => {
      result.current.toggleItemCategoryPicker("item-1");
    });
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(result.current.categoryPickerItemId).toBeNull();
  });

  it("ピッカー外のmousedownで状態がリセットされる", () => {
    const { result } = renderHook(() => useCategoryPickerController());
    act(() => {
      result.current.toggleItemCategoryPicker("item-1");
    });
    act(() => {
      const outside = document.createElement("div");
      document.body.appendChild(outside);
      outside.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      document.body.removeChild(outside);
    });
    expect(result.current.categoryPickerItemId).toBeNull();
  });

  it("ピッカー内の要素（data-category-picker）でのmousedownでは閉じない", () => {
    const { result } = renderHook(() => useCategoryPickerController());
    act(() => {
      result.current.toggleItemCategoryPicker("item-1");
    });
    act(() => {
      const inside = document.createElement("div");
      inside.setAttribute("data-category-picker", "");
      document.body.appendChild(inside);
      inside.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      document.body.removeChild(inside);
    });
    expect(result.current.categoryPickerItemId).toBe("item-1");
  });

  it("ピッカーが閉じているときはイベントリスナーを登録しない", () => {
    const addSpy = jest.spyOn(document, "addEventListener");
    renderHook(() => useCategoryPickerController());
    expect(addSpy).not.toHaveBeenCalled();
    addSpy.mockRestore();
  });
});
