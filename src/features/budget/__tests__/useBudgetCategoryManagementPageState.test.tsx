import { renderHook } from "@testing-library/react";
import { useBudgetCategoryManagementPageState } from "../useBudgetCategoryManagementPageState";
import { useBudgetCategoryManagementFormState } from "../useBudgetCategoryManagementFormState";
import { useBudgetCategoryManagementFormFocus } from "../useBudgetCategoryManagementFormFocus";
import { useBudgetCategoryManagementDataState } from "../useBudgetCategoryManagementDataState";
import { useBudgetCategoryManagementNameEditing } from "../useBudgetCategoryManagementNameEditing";

jest.mock("../useBudgetCategoryManagementFormState", () => ({
  useBudgetCategoryManagementFormState: jest.fn(),
}));
jest.mock("../useBudgetCategoryManagementFormFocus", () => ({
  useBudgetCategoryManagementFormFocus: jest.fn(),
}));
jest.mock("../useBudgetCategoryManagementDataState", () => ({
  useBudgetCategoryManagementDataState: jest.fn(),
}));
jest.mock("../useBudgetCategoryManagementNameEditing", () => ({
  useBudgetCategoryManagementNameEditing: jest.fn(),
}));

const mockUseFormState =
  useBudgetCategoryManagementFormState as jest.MockedFunction<
    typeof useBudgetCategoryManagementFormState
  >;
const mockUseFormFocus =
  useBudgetCategoryManagementFormFocus as jest.MockedFunction<
    typeof useBudgetCategoryManagementFormFocus
  >;
const mockUseDataState =
  useBudgetCategoryManagementDataState as jest.MockedFunction<
    typeof useBudgetCategoryManagementDataState
  >;
const mockUseNameEditing =
  useBudgetCategoryManagementNameEditing as jest.MockedFunction<
    typeof useBudgetCategoryManagementNameEditing
  >;

describe("useBudgetCategoryManagementPageState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseFormState.mockReturnValue({
      inputRef: { current: null },
      nameInput: "交通費",
      showForm: true,
      setNameInput: jest.fn(),
      openForm: jest.fn(),
      closeForm: jest.fn(),
    });
    mockUseDataState.mockReturnValue({
      categories: [
        { id: "cat-1", name: "食料品", createdAt: "2026-05-01T00:00:00.000Z" },
      ],
      handleCreate: jest.fn(),
      handleRename: jest.fn(),
      handleDelete: jest.fn(),
    });
    mockUseNameEditing.mockReturnValue({
      editingCategoryId: null,
      editingCategoryNameValue: "",
      setEditingCategoryNameValue: jest.fn(),
      startEditCategoryName: jest.fn(),
      commitEditCategoryName: jest.fn(),
      cancelEditCategoryName: jest.fn(),
    });
    mockUseFormFocus.mockReturnValue(undefined);
  });

  it("各フックを正しい引数で合成し、値をまとめて返す", () => {
    const { result } = renderHook(() => useBudgetCategoryManagementPageState());

    expect(mockUseDataState).toHaveBeenCalledWith({
      nameInput: "交通費",
      closeForm: expect.any(Function),
    });
    expect(mockUseNameEditing).toHaveBeenCalledWith({
      handleRename: expect.any(Function),
    });
    expect(mockUseFormFocus).toHaveBeenCalledWith({
      inputRef: { current: null },
      showForm: true,
    });

    expect(result.current.categories).toEqual([
      { id: "cat-1", name: "食料品", createdAt: "2026-05-01T00:00:00.000Z" },
    ]);
    expect(result.current.nameInput).toBe("交通費");
    expect(result.current.showForm).toBe(true);
    expect(result.current.editingCategoryId).toBeNull();
  });
});
