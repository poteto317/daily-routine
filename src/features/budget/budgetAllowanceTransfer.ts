import type { BudgetExpenseItem, BudgetIncomeItem } from "@/types/routine";
import { normalizeCategoryName } from "./budgetCategoryNameNormalization";
import { createBudgetExpenseItem } from "./budgetExpenseItemFactory";
import { createBudgetIncomeItem } from "./budgetIncomeItemFactory";

const FILE_TYPE = "daily-routine-budget-allowance";
const FILE_VERSION = 1 as const;
/** インポートで受け付けるファイルの上限 */
export const BUDGET_ALLOWANCE_IMPORT_MAX_BYTES = 1024 * 1024;

export type BudgetAllowanceExportFile = {
  type: typeof FILE_TYPE;
  version: typeof FILE_VERSION;
  exportDate: string;
  incomeItems: BudgetIncomeItem[];
  expenseItems: BudgetExpenseItem[];
};

export type BudgetAllowanceImportFailure = "invalidFormat" | "empty";

export type BudgetAllowanceImportResult =
  | {
      ok: true;
      incomeItems: BudgetIncomeItem[];
      expenseItems: BudgetExpenseItem[];
    }
  | { ok: false; reason: BudgetAllowanceImportFailure };

/** 検証を通った name と amount。raw は未検証の元の値で、kind・id・createdAt は読む側で確かめる */
type ItemFields = {
  raw: Record<string, unknown>;
  name: string;
  amount: number;
};

/** now を省略すると現在時刻を exportDate にする */
export const buildBudgetAllowanceExport = (
  incomeItems: BudgetIncomeItem[],
  expenseItems: BudgetExpenseItem[],
  now: Date = new Date(),
): BudgetAllowanceExportFile => ({
  type: FILE_TYPE,
  version: FILE_VERSION,
  exportDate: now.toISOString(),
  incomeItems,
  expenseItems,
});

export const getBudgetAllowanceExportFileName = (date: string): string =>
  `${FILE_TYPE}-${date}.json`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value !== "";

const readItemFields = (raw: unknown): ItemFields | null => {
  if (!isRecord(raw)) return null;

  const { name, amount } = raw;
  if (typeof name !== "string") return null;
  const normalizedName = normalizeCategoryName(name);
  if (normalizedName === null) return null;
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return { raw, name: normalizedName, amount };
};

/**
 * 配列を全件検証し、保存する項目に組み立てる。1 件でも不正なら null を返す。
 *
 * createItem が作る項目を土台に、ファイルの id と createdAt だけを移す。raw を
 * 展開しないのは、未知のキーを保存しないため。
 */
const parseItems = <Item extends { id: string; createdAt: string }>(
  rawItems: unknown[],
  createItem: (fields: ItemFields) => Item | null,
): Item[] | null => {
  const usedIds = new Set<string>();
  const items: Item[] = [];

  for (const rawItem of rawItems) {
    const fields = readItemFields(rawItem);
    if (!fields) return null;
    const item = createItem(fields);
    if (!item) return null;

    const { id, createdAt } = fields.raw;
    if (isNonEmptyString(id) && !usedIds.has(id)) item.id = id;
    if (isNonEmptyString(createdAt)) item.createdAt = createdAt;
    usedIds.add(item.id);
    items.push(item);
  }

  return items;
};

const createIncomeItem = ({ name, amount }: ItemFields): BudgetIncomeItem =>
  createBudgetIncomeItem(name, amount);

const createExpenseItem = ({
  raw,
  name,
  amount,
}: ItemFields): BudgetExpenseItem | null => {
  const { kind } = raw;
  if (kind !== "fixed" && kind !== "variable") return null;
  return createBudgetExpenseItem(name, amount, kind);
};

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const parseBudgetAllowanceImport = (
  text: string,
): BudgetAllowanceImportResult => {
  const invalidFormat = { ok: false, reason: "invalidFormat" } as const;

  const file = parseJson(text);
  if (!isRecord(file)) return invalidFormat;
  if (file.type !== FILE_TYPE || file.version !== FILE_VERSION) {
    return invalidFormat;
  }
  if (!Array.isArray(file.incomeItems) || !Array.isArray(file.expenseItems)) {
    return invalidFormat;
  }

  const incomeItems = parseItems(file.incomeItems, createIncomeItem);
  const expenseItems = parseItems(file.expenseItems, createExpenseItem);
  if (!incomeItems || !expenseItems) return invalidFormat;

  // 読み込むと全項目が消えるため、空のファイルは受け付けない
  if (incomeItems.length === 0 && expenseItems.length === 0) {
    return { ok: false, reason: "empty" };
  }

  return { ok: true, incomeItems, expenseItems };
};
