import budgetTexts from "../locales/ja.json";

type BudgetBudgetInputFormProps = {
  value: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

export const BudgetBudgetInputForm = ({
  value,
  onChange,
  onCancel,
  onSave,
}: BudgetBudgetInputFormProps) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-200 rounded-xl p-4 mb-6">
      <h4 className="font-bold text-gray-900 dark:text-black mb-3">
        {budgetTexts.budgetInputForm.title}
      </h4>
      <div className="flex gap-3">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={budgetTexts.budgetInputForm.placeholder}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-white text-gray-900"
          autoFocus
        />
        <button
          onClick={onSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
        >
          {budgetTexts.budgetInputForm.save}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-400 text-gray-700 dark:text-gray-900 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
        >
          {budgetTexts.budgetInputForm.cancel}
        </button>
      </div>
    </div>
  );
};
