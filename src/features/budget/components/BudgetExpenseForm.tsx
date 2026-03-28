import { getBudgetExpenseDateBounds } from "../helpers";
import budgetTexts from "../locales/ja.json";

type BudgetExpenseFormProps = {
  currentDate: Date;
  expenseAmount: string;
  expenseDate: string;
  expenseDescription: string;
  onAdd: () => void;
  onAmountChange: (value: string) => void;
  onCancel: () => void;
  onDateChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

export const BudgetExpenseForm = ({
  currentDate,
  expenseAmount,
  expenseDate,
  expenseDescription,
  onAdd,
  onAmountChange,
  onCancel,
  onDateChange,
  onDescriptionChange,
}: BudgetExpenseFormProps) => {
  const { minDate, maxDate } = getBudgetExpenseDateBounds(currentDate);

  return (
    <div className="bg-gray-50 dark:bg-gray-200 rounded-xl p-4 mb-6">
      <h4 className="font-bold text-gray-900 dark:text-black mb-3">
        {budgetTexts.expenseForm.title}
      </h4>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-1">
            {budgetTexts.expenseForm.dateLabel}
          </label>
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => onDateChange(e.target.value)}
            min={minDate}
            max={maxDate}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-white text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-1">
            {budgetTexts.expenseForm.amountLabel}{" "}
            <span className="text-red-500">{budgetTexts.expenseForm.requiredMark}</span>
          </label>
          <input
            type="number"
            value={expenseAmount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder={budgetTexts.expenseForm.amountPlaceholder}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-white text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-1">
            {budgetTexts.expenseForm.descriptionLabel}
          </label>
          <input
            type="text"
            value={expenseDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={budgetTexts.expenseForm.descriptionPlaceholder}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-white text-gray-900"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onAdd}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
          >
            {budgetTexts.expenseForm.addLabel}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-300 dark:bg-gray-400 text-gray-700 dark:text-gray-900 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            {budgetTexts.expenseForm.cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
