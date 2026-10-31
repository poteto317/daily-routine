import {
  LOCAL_DATA_UPDATED_AT_EVENT,
  getLocalDataUpdatedAt,
} from "@/lib/storage/core";
import {
  getBudgetExpenseItems,
  getBudgetIncomeItems,
  saveBudgetAllowanceItems,
  saveBudgetExpenseItems,
  saveBudgetIncomeItems,
} from "../storage";

const buildIncomeItem = (id: string) => ({
  id,
  name: "給与",
  amount: 300000,
  createdAt: "2026-05-01T00:00:00.000Z",
});
const buildExpenseItem = (id: string) => ({
  id,
  name: "家賃",
  amount: 80000,
  kind: "fixed" as const,
  createdAt: "2026-05-01T00:00:00.000Z",
});

const previousIncome = [buildIncomeItem("income-old")];
const previousExpense = [buildExpenseItem("expense-old")];
const nextIncome = [buildIncomeItem("income-new")];
const nextExpense = [buildExpenseItem("expense-new")];

/** 指定したキーへの書き込みだけを容量超過で失敗させる */
const failWritesTo = (keyPart: string) => {
  const realSetItem = Storage.prototype.setItem;
  return jest.spyOn(Storage.prototype, "setItem").mockImplementation(function (
    this: Storage,
    key,
    value,
  ) {
    if (key.includes(keyPart)) {
      throw new DOMException("quota", "QuotaExceededError");
    }
    realSetItem.call(this, key, value);
  });
};

/** 支出への書き込みと、2 回目以降の収入への書き込み（書き戻し）を失敗させる */
const failExpenseWritesAndIncomeRollback = () => {
  const realSetItem = Storage.prototype.setItem;
  let incomeWrites = 0;
  return jest.spyOn(Storage.prototype, "setItem").mockImplementation(function (
    this: Storage,
    key,
    value,
  ) {
    if (key.includes("budget-income-items")) incomeWrites += 1;
    if (
      key.includes("budget-expense-items") ||
      (key.includes("budget-income-items") && incomeWrites >= 2)
    ) {
      throw new DOMException("quota", "QuotaExceededError");
    }
    realSetItem.call(this, key, value);
  });
};

describe("saveBudgetAllowanceItems", () => {
  const onUpdatedAtChanged = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    saveBudgetIncomeItems(previousIncome);
    saveBudgetExpenseItems(previousExpense);
    // 初期データの書き込みで進んだ分を除いて数える
    onUpdatedAtChanged.mockClear();
    window.addEventListener(LOCAL_DATA_UPDATED_AT_EVENT, onUpdatedAtChanged);
  });

  afterEach(() => {
    window.removeEventListener(LOCAL_DATA_UPDATED_AT_EVENT, onUpdatedAtChanged);
    jest.restoreAllMocks();
  });

  it("両方を保存し、更新時刻を 1 回だけ進めて saved を返す", () => {
    const now = getLocalDataUpdatedAt() + 1000;
    jest.spyOn(Date, "now").mockReturnValue(now);

    const result = saveBudgetAllowanceItems(nextIncome, nextExpense);

    expect(result).toBe("saved");
    expect(getBudgetIncomeItems()).toEqual(nextIncome);
    expect(getBudgetExpenseItems()).toEqual(nextExpense);
    expect(onUpdatedAtChanged).toHaveBeenCalledTimes(1);
    expect(getLocalDataUpdatedAt()).toBe(now);
  });

  it("支出の保存に失敗したら、収入を元に戻し、更新時刻を変えず failed を返す", () => {
    // 書き戻しで更新時刻が進めば検出できるよう、時計を先へ進めておく
    const before = getLocalDataUpdatedAt();
    jest.spyOn(Date, "now").mockReturnValue(before + 1000);
    failWritesTo("budget-expense-items");

    const result = saveBudgetAllowanceItems(nextIncome, nextExpense);

    expect(result).toBe("failed");
    expect(getBudgetIncomeItems()).toEqual(previousIncome);
    expect(getBudgetExpenseItems()).toEqual(previousExpense);
    expect(onUpdatedAtChanged).not.toHaveBeenCalled();
    expect(getLocalDataUpdatedAt()).toBe(before);
  });

  it("収入の保存に失敗したら、何も書き戻さず、更新時刻を変えず failed を返す", () => {
    // 書き戻しで更新時刻が進めば検出できるよう、時計を先へ進めておく
    const before = getLocalDataUpdatedAt();
    jest.spyOn(Date, "now").mockReturnValue(before + 1000);
    const setItemSpy = failWritesTo("budget-income-items");

    const result = saveBudgetAllowanceItems(nextIncome, nextExpense);

    expect(result).toBe("failed");
    expect(getBudgetIncomeItems()).toEqual(previousIncome);
    expect(getBudgetExpenseItems()).toEqual(previousExpense);
    expect(setItemSpy).toHaveBeenCalledTimes(1);
    expect(onUpdatedAtChanged).not.toHaveBeenCalled();
    expect(getLocalDataUpdatedAt()).toBe(before);
  });

  it("収入の書き戻しにも失敗したら、更新時刻を進めず rollbackFailed を返す", () => {
    const before = getLocalDataUpdatedAt();
    jest.spyOn(Date, "now").mockReturnValue(before + 1000);
    failExpenseWritesAndIncomeRollback();

    const result = saveBudgetAllowanceItems(nextIncome, nextExpense);

    expect(result).toBe("rollbackFailed");
    expect(getBudgetIncomeItems()).toEqual(nextIncome);
    expect(getBudgetExpenseItems()).toEqual(previousExpense);
    expect(onUpdatedAtChanged).not.toHaveBeenCalled();
    expect(getLocalDataUpdatedAt()).toBe(before);
  });
});
