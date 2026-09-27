import type { ReactNode } from "react";
import { formatCurrency } from "../utils/format";

type BudgetMoneyCardProps = {
  cardClassName: string;
  children?: ReactNode;
  label: string;
  labelAction?: ReactNode;
  value: number;
  valueClassName: string;
};

/**
 * 家計簿サマリー画面で繰り返し使われる
 * 「色付きカード + ラベル(+任意のアクション) + 金額」の表示をまとめた
 * 表示専用コンポーネント。BudgetDailySummaryCards / BudgetMonthlySummaryCards
 * の両方から使い、カード固有の補足行（内訳・件数など）は
 * childrenで差し込む。
 */
export const BudgetMoneyCard = ({
  cardClassName,
  children,
  label,
  labelAction,
  value,
  valueClassName,
}: BudgetMoneyCardProps) => {
  return (
    <div className={cardClassName}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-700 dark:text-gray-900 font-medium">
          {label}
        </p>
        {labelAction}
      </div>
      <p className={valueClassName}>{formatCurrency(value)}</p>
      {children}
    </div>
  );
};
