import { renderHook } from "@testing-library/react";

jest.mock("../useColorPickerController", () => ({
  useColorPickerController: jest.fn(),
}));

jest.mock("../useItemActionMenuController", () => ({
  useItemActionMenuController: jest.fn(),
}));

import { useColorPickerController } from "../useColorPickerController";
import { useItemActionMenuController } from "../useItemActionMenuController";
import { useTodoListDetailUIControllers } from "../useTodoListDetailUIControllers";

const colorPickerMock = {
  colorPickerItemId: null,
  showBulkColorPicker: false,
  toggleItemColorPicker: jest.fn(),
  closeItemColorPicker: jest.fn(),
  toggleBulkColorPicker: jest.fn(),
  closeBulkColorPicker: jest.fn(),
};

const itemMenuMock = {
  itemMenuItemId: null,
  toggleItemMenu: jest.fn(),
  closeItemMenu: jest.fn(),
};

describe("useTodoListDetailUIControllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useColorPickerController as jest.Mock).mockReturnValue(colorPickerMock);
    (useItemActionMenuController as jest.Mock).mockReturnValue(itemMenuMock);
  });

  it("useColorPickerController・useItemActionMenuController を呼ぶ", () => {
    renderHook(() => useTodoListDetailUIControllers());

    expect(useColorPickerController).toHaveBeenCalled();
    expect(useItemActionMenuController).toHaveBeenCalled();
  });

  describe("colorPicker グループ", () => {
    it("colorPicker プロパティが存在する", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());
      expect(result.current.colorPicker).toBeDefined();
    });

    it("colorPicker に useColorPickerController の戻り値がそのまま入る", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());

      expect(result.current.colorPicker).toBe(colorPickerMock);
    });

    it("colorPickerItemId が non-null のとき colorPicker に伝播する", () => {
      (useColorPickerController as jest.Mock).mockReturnValue({
        ...colorPickerMock,
        colorPickerItemId: "item-42",
      });

      const { result } = renderHook(() => useTodoListDetailUIControllers());

      expect(result.current.colorPicker.colorPickerItemId).toBe("item-42");
    });

    it("showBulkColorPicker=true のとき colorPicker に伝播する", () => {
      (useColorPickerController as jest.Mock).mockReturnValue({
        ...colorPickerMock,
        showBulkColorPicker: true,
      });

      const { result } = renderHook(() => useTodoListDetailUIControllers());

      expect(result.current.colorPicker.showBulkColorPicker).toBe(true);
    });
  });

  describe("itemMenu グループ", () => {
    it("itemMenu プロパティが存在する", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());
      expect(result.current.itemMenu).toBeDefined();
    });

    it("itemMenu に useItemActionMenuController の戻り値がそのまま入る", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());

      expect(result.current.itemMenu).toBe(itemMenuMock);
    });

    it("itemMenuItemId が non-null のとき itemMenu に伝播する", () => {
      (useItemActionMenuController as jest.Mock).mockReturnValue({
        ...itemMenuMock,
        itemMenuItemId: "item-99",
      });

      const { result } = renderHook(() => useTodoListDetailUIControllers());

      expect(result.current.itemMenu.itemMenuItemId).toBe("item-99");
    });
  });

  describe("グループ分離", () => {
    it("colorPicker と itemMenu は独立したオブジェクトとして返される", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());

      expect(result.current.colorPicker).not.toBe(result.current.itemMenu);
    });

    it("colorPicker のプロパティがトップレベルに漏れ出ない", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());

      expect(result.current).not.toHaveProperty("colorPickerItemId");
      expect(result.current).not.toHaveProperty("showBulkColorPicker");
      expect(result.current).not.toHaveProperty("toggleItemColorPicker");
    });

    it("itemMenu のプロパティがトップレベルに漏れ出ない", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());

      expect(result.current).not.toHaveProperty("itemMenuItemId");
      expect(result.current).not.toHaveProperty("toggleItemMenu");
      expect(result.current).not.toHaveProperty("closeItemMenu");
    });
  });
});
