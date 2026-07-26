import { renderHook } from "@testing-library/react";
import { useTodoCategoryManagementPageState } from "../useTodoCategoryManagementPageState";
import { useTodoCategoryManagementFormState } from "../useTodoCategoryManagementFormState";
import { useTodoCategoryManagementFormFocus } from "../useTodoCategoryManagementFormFocus";
import { useTodoCategoryManagementDataState } from "../useTodoCategoryManagementDataState";
import { useTodoCategoryManagementNameEditing } from "../useTodoCategoryManagementNameEditing";
import { useTodoCategoryDragAndDrop } from "../useTodoCategoryDragAndDrop";
import { useColorPickerController } from "../useColorPickerController";

jest.mock("../useTodoCategoryManagementFormState", () => ({
  useTodoCategoryManagementFormState: jest.fn(),
}));
jest.mock("../useTodoCategoryManagementFormFocus", () => ({
  useTodoCategoryManagementFormFocus: jest.fn(),
}));
jest.mock("../useTodoCategoryManagementDataState", () => ({
  useTodoCategoryManagementDataState: jest.fn(),
}));
jest.mock("../useTodoCategoryManagementNameEditing", () => ({
  useTodoCategoryManagementNameEditing: jest.fn(),
}));
jest.mock("../useTodoCategoryDragAndDrop", () => ({
  useTodoCategoryDragAndDrop: jest.fn(),
}));
jest.mock("../useColorPickerController", () => ({
  useColorPickerController: jest.fn(),
}));

const mockUseFormState = useTodoCategoryManagementFormState as jest.MockedFunction<
  typeof useTodoCategoryManagementFormState
>;
const mockUseFormFocus = useTodoCategoryManagementFormFocus as jest.MockedFunction<
  typeof useTodoCategoryManagementFormFocus
>;
const mockUseDataState = useTodoCategoryManagementDataState as jest.MockedFunction<
  typeof useTodoCategoryManagementDataState
>;
const mockUseNameEditing = useTodoCategoryManagementNameEditing as jest.MockedFunction<
  typeof useTodoCategoryManagementNameEditing
>;
const mockUseDragAndDrop = useTodoCategoryDragAndDrop as jest.MockedFunction<
  typeof useTodoCategoryDragAndDrop
>;
const mockUseColorPickerController =
  useColorPickerController as jest.MockedFunction<
    typeof useColorPickerController
  >;

describe("useTodoCategoryManagementPageState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseFormState.mockReturnValue({
      inputRef: { current: null },
      nameInput: "プライベート",
      colorInput: "bg-blue-50",
      showForm: true,
      setNameInput: jest.fn(),
      setColorInput: jest.fn(),
      openForm: jest.fn(),
      closeForm: jest.fn(),
    });
    mockUseDataState.mockReturnValue({
      categories: [
        { id: "cat-1", name: "仕事", createdAt: "2026-05-01T00:00:00.000Z" },
      ],
      handleCreate: jest.fn(),
      handleRename: jest.fn(),
      handleUpdateColor: jest.fn(),
      handleDelete: jest.fn(),
      handleReorderCategories: jest.fn(),
    });
    mockUseNameEditing.mockReturnValue({
      editingCategoryId: null,
      editingCategoryNameValue: "",
      setEditingCategoryNameValue: jest.fn(),
      startEditCategoryName: jest.fn(),
      commitEditCategoryName: jest.fn(),
      cancelEditCategoryName: jest.fn(),
    });
    mockUseDragAndDrop.mockReturnValue({
      activeId: null,
      sensors: [],
      handleDragStart: jest.fn(),
      handleDragEnd: jest.fn(),
      handleDragCancel: jest.fn(),
    });
    mockUseFormFocus.mockReturnValue(undefined);
    mockUseColorPickerController.mockReturnValue({
      colorPickerItemId: null,
      showBulkColorPicker: false,
      toggleItemColorPicker: jest.fn(),
      closeItemColorPicker: jest.fn(),
      toggleBulkColorPicker: jest.fn(),
      closeBulkColorPicker: jest.fn(),
    });
  });

  it("各フックを正しい引数で合成し、値をまとめて返す", () => {
    const { result } = renderHook(() =>
      useTodoCategoryManagementPageState(),
    );

    expect(mockUseDataState).toHaveBeenCalledWith({
      nameInput: "プライベート",
      colorInput: "bg-blue-50",
      closeForm: expect.any(Function),
    });
    expect(mockUseNameEditing).toHaveBeenCalledWith({
      handleRename: expect.any(Function),
    });
    expect(mockUseFormFocus).toHaveBeenCalledWith({
      inputRef: { current: null },
      showForm: true,
    });
    expect(mockUseDragAndDrop).toHaveBeenCalledWith({
      categories: [
        { id: "cat-1", name: "仕事", createdAt: "2026-05-01T00:00:00.000Z" },
      ],
      onReorderCategories: expect.any(Function),
    });
    expect(result.current.dnd).toEqual({
      activeId: null,
      sensors: [],
      handleDragStart: expect.any(Function),
      handleDragEnd: expect.any(Function),
      handleDragCancel: expect.any(Function),
    });

    expect(result.current.categories).toEqual([
      { id: "cat-1", name: "仕事", createdAt: "2026-05-01T00:00:00.000Z" },
    ]);
    expect(result.current.nameInput).toBe("プライベート");
    expect(result.current.colorInput).toBe("bg-blue-50");
    expect(result.current.showForm).toBe(true);
    expect(result.current.editingCategoryId).toBeNull();
    expect(typeof result.current.handleUpdateColor).toBe("function");
    expect(result.current.colorEditingCategoryId).toBeNull();
    expect(typeof result.current.toggleCategoryColorPicker).toBe("function");
    expect(typeof result.current.closeCategoryColorPicker).toBe("function");
  });

  it("useColorPickerControllerのcolorPickerItemIdをcolorEditingCategoryIdとして公開する", () => {
    mockUseColorPickerController.mockReturnValue({
      colorPickerItemId: "cat-1",
      showBulkColorPicker: false,
      toggleItemColorPicker: jest.fn(),
      closeItemColorPicker: jest.fn(),
      toggleBulkColorPicker: jest.fn(),
      closeBulkColorPicker: jest.fn(),
    });

    const { result } = renderHook(() => useTodoCategoryManagementPageState());

    expect(result.current.colorEditingCategoryId).toBe("cat-1");
  });
});
