import { renderHook } from "@testing-library/react";

jest.mock("../useColorPickerController", () => ({
  useColorPickerController: jest.fn(),
}));

jest.mock("../useMobileActionMenuController", () => ({
  useMobileActionMenuController: jest.fn(),
}));

import { useColorPickerController } from "../useColorPickerController";
import { useMobileActionMenuController } from "../useMobileActionMenuController";
import { useTodoListDetailUIControllers } from "../useTodoListDetailUIControllers";

const colorPickerMock = {
  colorPickerItemId: null,
  showBulkColorPicker: false,
  toggleItemColorPicker: jest.fn(),
  closeItemColorPicker: jest.fn(),
  toggleBulkColorPicker: jest.fn(),
  closeBulkColorPicker: jest.fn(),
};

const mobileMenuMock = {
  mobileMenuItemId: null,
  toggleMobileMenu: jest.fn(),
  closeMobileMenu: jest.fn(),
};

describe("useTodoListDetailUIControllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useColorPickerController as jest.Mock).mockReturnValue(colorPickerMock);
    (useMobileActionMenuController as jest.Mock).mockReturnValue(mobileMenuMock);
  });

  it("useColorPickerController と useMobileActionMenuController を呼ぶ", () => {
    renderHook(() => useTodoListDetailUIControllers());

    expect(useColorPickerController).toHaveBeenCalled();
    expect(useMobileActionMenuController).toHaveBeenCalled();
  });

  describe("colorPicker グループ", () => {
    it("colorPicker プロパティが存在する", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());
      expect(result.current.colorPicker).toBeDefined();
    });

    it("colorPicker に useColorPickerController の戻り値が入る", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());

      expect(result.current.colorPicker.colorPickerItemId).toBeNull();
      expect(result.current.colorPicker.showBulkColorPicker).toBe(false);
      expect(result.current.colorPicker.toggleItemColorPicker).toBe(
        colorPickerMock.toggleItemColorPicker,
      );
      expect(result.current.colorPicker.closeItemColorPicker).toBe(
        colorPickerMock.closeItemColorPicker,
      );
      expect(result.current.colorPicker.toggleBulkColorPicker).toBe(
        colorPickerMock.toggleBulkColorPicker,
      );
      expect(result.current.colorPicker.closeBulkColorPicker).toBe(
        colorPickerMock.closeBulkColorPicker,
      );
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

  describe("mobileMenu グループ", () => {
    it("mobileMenu プロパティが存在する", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());
      expect(result.current.mobileMenu).toBeDefined();
    });

    it("mobileMenu に useMobileActionMenuController の戻り値が入る", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());

      expect(result.current.mobileMenu.mobileMenuItemId).toBeNull();
      expect(result.current.mobileMenu.toggleMobileMenu).toBe(
        mobileMenuMock.toggleMobileMenu,
      );
      expect(result.current.mobileMenu.closeMobileMenu).toBe(
        mobileMenuMock.closeMobileMenu,
      );
    });

    it("mobileMenuItemId が non-null のとき mobileMenu に伝播する", () => {
      (useMobileActionMenuController as jest.Mock).mockReturnValue({
        ...mobileMenuMock,
        mobileMenuItemId: "item-99",
      });

      const { result } = renderHook(() => useTodoListDetailUIControllers());

      expect(result.current.mobileMenu.mobileMenuItemId).toBe("item-99");
    });
  });

  describe("グループ分離", () => {
    it("colorPicker と mobileMenu は独立したオブジェクトとして返される", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());

      expect(result.current.colorPicker).not.toBe(result.current.mobileMenu);
    });

    it("colorPicker のプロパティがトップレベルに漏れ出ない", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());

      expect(result.current).not.toHaveProperty("colorPickerItemId");
      expect(result.current).not.toHaveProperty("showBulkColorPicker");
      expect(result.current).not.toHaveProperty("toggleItemColorPicker");
    });

    it("mobileMenu のプロパティがトップレベルに漏れ出ない", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());

      expect(result.current).not.toHaveProperty("mobileMenuItemId");
      expect(result.current).not.toHaveProperty("toggleMobileMenu");
      expect(result.current).not.toHaveProperty("closeMobileMenu");
    });
  });
});
