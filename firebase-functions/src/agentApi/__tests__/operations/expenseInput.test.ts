/** @jest-environment node */
import {
  assertCategoryExists,
  parseCreateExpenseInput,
  parseExpensePatchInput,
} from "../../operations/expenses/expenseInput";
import { expectApiError } from "../testUtils";

const data = { budgetCategories: [{ id: "budget-category-1" }] };

describe("assertCategoryExists", () => {
  it("存在するカテゴリは通す", () => {
    expect(() => assertCategoryExists(data, "budget-category-1")).not.toThrow();
  });

  it("存在しない・カテゴリ未設定のデータは 400 invalid_field", () => {
    expectApiError(
      () => assertCategoryExists(data, "nope"),
      400,
      "invalid_field",
    );
    expectApiError(() => assertCategoryExists({}, "x"), 400, "invalid_field");
  });
});

describe("parseCreateExpenseInput", () => {
  it("date と amount だけで作成できる（他は undefined）", () => {
    expect(
      parseCreateExpenseInput({ date: "2026-10-01", amount: 100 }, data),
    ).toEqual({
      date: "2026-10-01",
      amount: 100,
      categoryId: undefined,
      usedTime: undefined,
    });
  });

  it("categoryId と usedTime を受け取る", () => {
    expect(
      parseCreateExpenseInput(
        {
          date: "2026-10-01",
          amount: 100,
          categoryId: "budget-category-1",
          usedTime: "09:05",
        },
        data,
      ),
    ).toMatchObject({ categoryId: "budget-category-1", usedTime: "09:05" });
  });

  it.each([
    { amount: 1 },
    { date: "2026-10-01" },
    { date: "2026-10-32", amount: 1 },
    { date: "2026-10-01", amount: 1, categoryId: "nope" },
    { date: "2026-10-01", amount: 1, usedTime: "24:00" },
    { date: "2026-10-01", amount: -1 },
  ])("不正な入力 %j は 400", (input) => {
    expectApiError(
      () => parseCreateExpenseInput(input, data),
      400,
      "invalid_field",
    );
  });
});

describe("parseCreateExpenseInput（0 円）", () => {
  it("0 円は、日付に関わらず、入力の形としては受け付ける（日付との組み合わせは expenseAmountRule で確認する）", () => {
    expect(
      parseCreateExpenseInput({ date: "2026-10-02", amount: 0 }, data),
    ).toMatchObject({ date: "2026-10-02", amount: 0 });
    expect(
      parseCreateExpenseInput({ date: "2099-01-01", amount: 0 }, data),
    ).toMatchObject({ amount: 0 });
  });
});

describe("parseExpensePatchInput", () => {
  it("指定したフィールドだけをパッチにする", () => {
    expect(parseExpensePatchInput({ amount: 700 }, data)).toEqual({
      patch: { amount: 700 },
      clearCategory: false,
    });
  });

  it("categoryId: null でカテゴリ解除を指示する（パッチには含めない）", () => {
    expect(parseExpensePatchInput({ categoryId: null }, data)).toEqual({
      patch: {},
      clearCategory: true,
    });
  });

  it("amount: 0 はパッチに含める（日付との組み合わせは、更新時に確認する）", () => {
    expect(parseExpensePatchInput({ amount: 0 }, data)).toEqual({
      patch: { amount: 0 },
      clearCategory: false,
    });
  });

  it("空の本文は 400 empty_patch", () => {
    expectApiError(() => parseExpensePatchInput({}, data), 400, "empty_patch");
  });

  it.each([
    { categoryId: "nope" },
    { amount: -1 },
    { date: "2026-02-30" },
    { usedTime: "9:00" },
  ])("不正な入力 %j は 400 invalid_field", (input) => {
    expectApiError(
      () => parseExpensePatchInput(input, data),
      400,
      "invalid_field",
    );
  });
});
