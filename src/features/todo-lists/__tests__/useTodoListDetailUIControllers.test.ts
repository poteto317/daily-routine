import { renderHook } from "@testing-library/react";

jest.mock("../useColorPickerController", () => ({
  useColorPickerController: jest.fn(),
}));

jest.mock("../useCategoryPickerController", () => ({
  useCategoryPickerController: jest.fn(),
}));

jest.mock("../useMobileActionMenuController", () => ({
  useMobileActionMenuController: jest.fn(),
}));

import { useColorPickerController } from "../useColorPickerController";
import { useCategoryPickerController } from "../useCategoryPickerController";
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

const categoryPickerMock = {
  categoryPickerItemId: null,
  toggleItemCategoryPicker: jest.fn(),
  closeItemCategoryPicker: jest.fn(),
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
    (useCategoryPickerController as jest.Mock).mockReturnValue(
      categoryPickerMock,
    );
    (useMobileActionMenuController as jest.Mock).mockReturnValue(mobileMenuMock);
  });

  it("useColorPickerController・useCategoryPickerController・useMobileActionMenuController を呼ぶ", () => {
    renderHook(() => useTodoListDetailUIControllers());

    expect(useColorPickerController).toHaveBeenCalled();
    expect(useCategoryPickerController).toHaveBeenCalled();
    expect(useMobileActionMenuController).toHaveBeenCalled();
  });

  describe("categoryPicker グループ", () => {
    it("categoryPicker プロパティが存在する", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());
      expect(result.current.categoryPicker).toBeDefined();
    });

    it("categoryPicker に useCategoryPickerController の戻り値が入る", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());

      expect(result.current.categoryPicker.categoryPickerItemId).toBeNull();
      // toggleItemCategoryPicker は colorPicker との排他制御のためラップされて
      // いるので、モックそのものへの参照一致ではなく呼び出し委譲を確認する
      result.current.categoryPicker.toggleItemCategoryPicker("item-1");
      expect(categoryPickerMock.toggleItemCategoryPicker).toHaveBeenCalledWith(
        "item-1",
      );
      expect(result.current.categoryPicker.closeItemCategoryPicker).toBe(
        categoryPickerMock.closeItemCategoryPicker,
      );
    });

    it("categoryPickerItemId が non-null のとき categoryPicker に伝播する", () => {
      (useCategoryPickerController as jest.Mock).mockReturnValue({
        ...categoryPickerMock,
        categoryPickerItemId: "item-7",
      });

      const { result } = renderHook(() => useTodoListDetailUIControllers());

      expect(result.current.categoryPicker.categoryPickerItemId).toBe(
        "item-7",
      );
    });
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
      // toggleItemColorPicker/toggleBulkColorPicker は categoryPicker との
      // 排他制御のためラップされているので、モックそのものへの参照一致ではなく
      // 呼び出し委譲を確認する
      result.current.colorPicker.toggleItemColorPicker("item-1");
      expect(colorPickerMock.toggleItemColorPicker).toHaveBeenCalledWith(
        "item-1",
      );
      result.current.colorPicker.toggleBulkColorPicker();
      expect(colorPickerMock.toggleBulkColorPicker).toHaveBeenCalled();
      expect(result.current.colorPicker.closeItemColorPicker).toBe(
        colorPickerMock.closeItemColorPicker,
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

    it("colorPicker と categoryPicker は独立したオブジェクトとして返される", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());

      expect(result.current.colorPicker).not.toBe(
        result.current.categoryPicker,
      );
    });

    it("colorPicker のプロパティがトップレベルに漏れ出ない", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());

      expect(result.current).not.toHaveProperty("colorPickerItemId");
      expect(result.current).not.toHaveProperty("showBulkColorPicker");
      expect(result.current).not.toHaveProperty("toggleItemColorPicker");
    });

    it("categoryPicker のプロパティがトップレベルに漏れ出ない", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());

      expect(result.current).not.toHaveProperty("categoryPickerItemId");
      expect(result.current).not.toHaveProperty("toggleItemCategoryPicker");
    });

    it("mobileMenu のプロパティがトップレベルに漏れ出ない", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());

      expect(result.current).not.toHaveProperty("mobileMenuItemId");
      expect(result.current).not.toHaveProperty("toggleMobileMenu");
      expect(result.current).not.toHaveProperty("closeMobileMenu");
    });
  });

  describe("colorPickerとcategoryPickerの排他制御（同一アイテムで両方同時に開くとポップオーバーが重なるため）", () => {
    it("toggleItemColorPicker を呼ぶと closeItemCategoryPicker が先に呼ばれる", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());

      result.current.colorPicker.toggleItemColorPicker("item-1");

      expect(categoryPickerMock.closeItemCategoryPicker).toHaveBeenCalled();
      expect(colorPickerMock.toggleItemColorPicker).toHaveBeenCalledWith(
        "item-1",
      );
    });

    it("toggleBulkColorPicker を呼ぶと closeItemCategoryPicker が先に呼ばれる", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());

      result.current.colorPicker.toggleBulkColorPicker();

      expect(categoryPickerMock.closeItemCategoryPicker).toHaveBeenCalled();
      expect(colorPickerMock.toggleBulkColorPicker).toHaveBeenCalled();
    });

    it("toggleItemCategoryPicker を呼ぶと closeItemColorPicker と closeBulkColorPicker が先に呼ばれる", () => {
      const { result } = renderHook(() => useTodoListDetailUIControllers());

      result.current.categoryPicker.toggleItemCategoryPicker("item-1");

      expect(colorPickerMock.closeItemColorPicker).toHaveBeenCalled();
      expect(colorPickerMock.closeBulkColorPicker).toHaveBeenCalled();
      expect(categoryPickerMock.toggleItemCategoryPicker).toHaveBeenCalledWith(
        "item-1",
      );
    });
  });

  describe("ラップされたトグル関数の参照安定性（再レンダーごとに新しい関数を生成しない）", () => {
    it("再レンダーしても toggleItemColorPicker/toggleBulkColorPicker/toggleItemCategoryPicker の参照が変わらない", () => {
      const { result, rerender } = renderHook(() =>
        useTodoListDetailUIControllers(),
      );

      const before = {
        toggleItemColorPicker: result.current.colorPicker.toggleItemColorPicker,
        toggleBulkColorPicker: result.current.colorPicker.toggleBulkColorPicker,
        toggleItemCategoryPicker:
          result.current.categoryPicker.toggleItemCategoryPicker,
      };

      rerender();

      expect(result.current.colorPicker.toggleItemColorPicker).toBe(
        before.toggleItemColorPicker,
      );
      expect(result.current.colorPicker.toggleBulkColorPicker).toBe(
        before.toggleBulkColorPicker,
      );
      expect(result.current.categoryPicker.toggleItemCategoryPicker).toBe(
        before.toggleItemCategoryPicker,
      );
    });
  });
});
