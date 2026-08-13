import {
  getBudgetCategories,
  getBudgetData,
  getBudgetExpenseItems,
  getBudgetIncomeItems,
  saveBudgetCategories,
  saveBudgetData,
  saveBudgetExpenseItems,
  saveBudgetIncomeItems,
} from "@/features/budget/storage";
import { DATA_TRANSFER_ERROR_MESSAGES } from "../errorMessages";
import {
  arrayField,
  objectField,
  type TransferField,
  type TransferPayload,
} from "../transferPayloadRestore";

const invalid = DATA_TRANSFER_ERROR_MESSAGES.invalidFieldFormat;

/** 家計簿グループ。設定・カテゴリ・収入項目・支出項目をまとめて扱う */
export const collectBudgetTransferData = (): TransferPayload => ({
  budgetData: getBudgetData(),
  budgetCategories: getBudgetCategories(),
  budgetIncomeItems: getBudgetIncomeItems(),
  budgetExpenseItems: getBudgetExpenseItems(),
});

export const BUDGET_TRANSFER_FIELDS: TransferField[] = [
  objectField("budgetData", saveBudgetData, invalid("budgetData")),
  arrayField(
    "budgetCategories",
    saveBudgetCategories,
    invalid("budgetCategories"),
  ),
  arrayField(
    "budgetIncomeItems",
    saveBudgetIncomeItems,
    invalid("budgetIncomeItems"),
  ),
  arrayField(
    "budgetExpenseItems",
    saveBudgetExpenseItems,
    invalid("budgetExpenseItems"),
  ),
];
