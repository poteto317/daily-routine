import type { BudgetDateSelectOption } from "../budgetExpenseDateOptions";
import {
  buildAdjacentMonthOptions,
  buildExpenseDayOptions,
} from "../budgetExpenseDateOptions";
import {
  clampDateToMonth,
  getMonthKeyFromDateValue,
  monthKeyToDate,
} from "../utils/date";
import budgetTexts from "../locales/ja.json";

type BudgetExpenseDateSelectProps = {
  /** "YYYY-MM-DD" 形式の日付文字列。 */
  value: string;
  onChange: (value: string) => void;
};

const selectClassName =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-white text-gray-900";

type DateOptionSelectProps = {
  value: string;
  options: BudgetDateSelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
};

/** 選択肢（value/label）の配列から1つの `<select>` を描画するだけの部品。 */
const DateOptionSelect = ({
  value,
  options,
  onChange,
  ariaLabel,
}: DateOptionSelectProps) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    aria-label={ariaLabel}
    className={selectClassName}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

/**
 * 支出の日付入力欄。ネイティブの `<input type="date">` は使わず、
 * 「月（前月/当月/翌月）」と「日」の2つの `<select>` で日付を選ばせる。
 * `<select>` には値をクリアする概念がないため、支出日付が必須である
 * という要件をUI上でもそのまま表現できる。
 *
 * 「前月/当月/翌月」の基準は、家計簿ページで表示中の月ではなく
 * 常に `value`（この欄が表す日付）自身の月を使う。表示中の月を
 * 別途propsで受け取って基準にすると、編集中に月ナビゲーション
 * （前月/次月ボタン）を操作した場合に選択肢が表示中の月へ動いてしまい、
 * 編集対象の日付の月が選択肢から外れて `<select>` の値と選択肢が
 * 食い違う不具合になるため、この欄の値そのものを基準にしている。
 */
export const BudgetExpenseDateSelect = ({
  value,
  onChange,
}: BudgetExpenseDateSelectProps) => {
  const monthKey = getMonthKeyFromDateValue(value);

  const monthOptions = buildAdjacentMonthOptions(monthKeyToDate(monthKey));
  const dayOptions = buildExpenseDayOptions(monthKey);

  const handleMonthChange = (nextMonthKey: string) => {
    onChange(clampDateToMonth(value, nextMonthKey));
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <DateOptionSelect
        value={monthKey}
        options={monthOptions}
        onChange={handleMonthChange}
        ariaLabel={budgetTexts.expenseForm.dateMonthLabel}
      />
      <DateOptionSelect
        value={value}
        options={dayOptions}
        onChange={onChange}
        ariaLabel={budgetTexts.expenseForm.dateDayLabel}
      />
    </div>
  );
};
