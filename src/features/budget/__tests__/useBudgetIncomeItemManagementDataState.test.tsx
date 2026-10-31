import { act, renderHook } from "@testing-library/react";
import { useBudgetIncomeItemManagementDataState } from "../useBudgetIncomeItemManagementDataState";
import { getBudgetIncomeItems, saveBudgetIncomeItems } from "../storage";
import {
  createBudgetIncomeItemAndPersist,
  deleteBudgetIncomeItemAndPersist,
  updateBudgetIncomeItemAndPersist,
} from "../budgetIncomeItemCrudPersistActions";

jest.mock("../storage", () => ({
  getBudgetIncomeItems: jest.fn(),
  saveBudgetIncomeItems: jest.fn(),
}));

jest.mock("../budgetIncomeItemCrudPersistActions", () => ({
  createBudgetIncomeItemAndPersist: jest.fn(),
  updateBudgetIncomeItemAndPersist: jest.fn(),
  deleteBudgetIncomeItemAndPersist: jest.fn(),
}));

const mockGetBudgetIncomeItems = getBudgetIncomeItems as jest.MockedFunction<
  typeof getBudgetIncomeItems
>;
const mockCreateBudgetIncomeItemAndPersist =
  createBudgetIncomeItemAndPersist as jest.MockedFunction<
    typeof createBudgetIncomeItemAndPersist
  >;
const mockUpdateBudgetIncomeItemAndPersist =
  updateBudgetIncomeItemAndPersist as jest.MockedFunction<
    typeof updateBudgetIncomeItemAndPersist
  >;
const mockDeleteBudgetIncomeItemAndPersist =
  deleteBudgetIncomeItemAndPersist as jest.MockedFunction<
    typeof deleteBudgetIncomeItemAndPersist
  >;

const item = {
  id: "income-1",
  name: "給与",
  amount: 300000,
  createdAt: "2026-05-01T00:00:00.000Z",
};

describe("useBudgetIncomeItemManagementDataState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBudgetIncomeItems.mockReturnValue([item]);
  });

  it("初期表示時にgetBudgetIncomeItemsで一覧を読み込む", () => {
    const { result } = renderHook(() =>
      useBudgetIncomeItemManagementDataState({
        nameInput: "副業",
        amountInput: "50000",
        closeForm: jest.fn(),
      }),
    );

    expect(result.current.items).toEqual([item]);
  });

  it("有効な金額の場合はhandleCreateが成功しstateを更新しcloseFormを呼ぶ", () => {
    const closeForm = jest.fn();
    const nextItems = [item, { ...item, id: "income-2" }];
    mockCreateBudgetIncomeItemAndPersist.mockImplementation(({ persist }) => {
      persist(nextItems);
      return nextItems;
    });

    const { result } = renderHook(() =>
      useBudgetIncomeItemManagementDataState({
        nameInput: "副業",
        amountInput: "50000",
        closeForm,
      }),
    );

    act(() => {
      result.current.handleCreate();
    });

    expect(mockCreateBudgetIncomeItemAndPersist).toHaveBeenCalledWith({
      items: [item],
      nameInput: "副業",
      amount: 50000,
      persist: expect.any(Function),
    });
    expect(closeForm).toHaveBeenCalled();
    expect(result.current.items).toEqual(nextItems);
  });

  it("金額が0以下の場合はhandleCreateがcreateBudgetIncomeItemAndPersistを呼ばずcloseFormも呼ばない", () => {
    const closeForm = jest.fn();

    const { result } = renderHook(() =>
      useBudgetIncomeItemManagementDataState({
        nameInput: "副業",
        amountInput: "0",
        closeForm,
      }),
    );

    act(() => {
      result.current.handleCreate();
    });

    expect(mockCreateBudgetIncomeItemAndPersist).not.toHaveBeenCalled();
    expect(closeForm).not.toHaveBeenCalled();
  });

  it("handleUpdateItemはupdateBudgetIncomeItemAndPersistへ名前と金額をまとめて委譲する", () => {
    const { result } = renderHook(() =>
      useBudgetIncomeItemManagementDataState({
        nameInput: "",
        amountInput: "",
        closeForm: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleUpdateItem("income-1", "本業給与", 320000);
    });

    expect(mockUpdateBudgetIncomeItemAndPersist).toHaveBeenCalledWith({
      items: [item],
      itemId: "income-1",
      name: "本業給与",
      amount: 320000,
      persist: expect.any(Function),
    });
  });

  it("handleDeleteはdeleteBudgetIncomeItemAndPersistへメッセージ付きで委譲する", () => {
    const { result } = renderHook(() =>
      useBudgetIncomeItemManagementDataState({
        nameInput: "",
        amountInput: "",
        closeForm: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleDelete(item);
    });

    expect(mockDeleteBudgetIncomeItemAndPersist).toHaveBeenCalledWith({
      items: [item],
      item,
      message: "「給与」を削除しますか？この操作は元に戻せません。",
      persist: expect.any(Function),
    });
  });

  it("persistはstateの更新とsaveBudgetIncomeItemsの両方を行う", () => {
    const nextItems = [item, { ...item, id: "income-2" }];
    mockCreateBudgetIncomeItemAndPersist.mockImplementation(({ persist }) => {
      persist(nextItems);
      return nextItems;
    });

    const { result } = renderHook(() =>
      useBudgetIncomeItemManagementDataState({
        nameInput: "副業",
        amountInput: "50000",
        closeForm: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleCreate();
    });

    expect(saveBudgetIncomeItems).toHaveBeenCalledWith(nextItems);
    expect(result.current.items).toEqual(nextItems);
  });

  it("reloadItemsでストレージから読み直し、itemsを更新する", () => {
    const { result } = renderHook(() =>
      useBudgetIncomeItemManagementDataState({
        nameInput: "副業",
        amountInput: "50000",
        closeForm: jest.fn(),
      }),
    );
    const reloadedItem = { ...item, id: "reloaded", name: "読み直した項目" };
    mockGetBudgetIncomeItems.mockReturnValue([reloadedItem]);

    act(() => {
      result.current.reloadItems();
    });

    expect(result.current.items).toEqual([reloadedItem]);
  });
});
