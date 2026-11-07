import { useId } from "react";
import { useLocalTodayKey } from "@/hooks/useToday";
import type { BudgetCategory } from "@/types/routine";
import budgetTexts from "../locales/ja.json";
import { isZeroAmountOnUnavailableDate } from "../utils/expenseAmountRule";
import { BudgetExpenseDateSelect } from "./BudgetExpenseDateSelect";
import { BudgetZeroAmountNotice } from "./BudgetZeroAmountNotice";

type BudgetExpenseEditFormProps = {
  categories: BudgetCategory[];
  editingExpenseDate: string;
  editingExpenseAmount: string;
  editingExpenseCategoryId: string;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditDateChange: (value: string) => void;
  onEditAmountChange: (value: string) => void;
  onEditCategoryIdChange: (value: string) => void;
};

/** 支出1件の編集フォーム（日付・金額・カテゴリの入力と、保存・キャンセル）。 */
export const BudgetExpenseEditForm = ({
  categories,
  editingExpenseDate,
  editingExpenseAmount,
  editingExpenseCategoryId,
  onCancelEdit,
  onSaveEdit,
  onEditDateChange,
  onEditAmountChange,
  onEditCategoryIdChange,
}: BudgetExpenseEditFormProps) => {
  const zeroNoticeId = useId();
  // 判定は日付の部分しか使わないので、今日（端末ローカル）の 0 時の Date で足りる。
  // 共通フックから取り、日をまたいだ後の再描画で新しい今日で判定する（React Compiler の固定を避ける）
  const todayKey = useLocalTodayKey();
  const isZeroRejected = isZeroAmountOnUnavailableDate(
    editingExpenseAmount,
    editingExpenseDate,
    new Date(`${todayKey}T00:00:00`),
  );

  return (
    <div className="bg-white dark:bg-white border border-blue-300 dark:border-blue-400 rounded-lg p-4">
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <BudgetExpenseDateSelect
            value={editingExpenseDate}
            onChange={onEditDateChange}
          />
          <input
            type="number"
            value={editingExpenseAmount}
            onChange={(e) => onEditAmountChange(e.target.value)}
            placeholder={budgetTexts.expenseForm.amountPlaceholder}
            aria-label={budgetTexts.expenseForm.amountLabel}
            aria-invalid={isZeroRejected}
            aria-describedby={isZeroRejected ? zeroNoticeId : undefined}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-white text-gray-900"
          />
        </div>
        <BudgetZeroAmountNotice id={zeroNoticeId} visible={isZeroRejected} />
        <select
          value={editingExpenseCategoryId}
          onChange={(e) => onEditCategoryIdChange(e.target.value)}
          aria-label={budgetTexts.expenseForm.categoryLabel}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-white text-gray-900"
        >
          <option value="">
            {budgetTexts.expenseForm.categoryPlaceholder}
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSaveEdit}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
          >
            {budgetTexts.expenseList.save}
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-6 py-2 bg-gray-300 dark:bg-gray-400 text-gray-700 dark:text-gray-900 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            {budgetTexts.expenseList.cancelEdit}
          </button>
        </div>
      </div>
    </div>
  );
};
