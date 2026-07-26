import type { ReactNode } from "react";

type BudgetSummaryCardsGridProps = {
  children: ReactNode;
};

/**
 * BudgetMonthlySummaryCards / BudgetDailySummaryCards で共通の
 * グリッドレイアウト（2枚まで並ぶカード群）をまとめた表示専用コンポーネント。
 */
export const BudgetSummaryCardsGrid = ({
  children,
}: BudgetSummaryCardsGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {children}
    </div>
  );
};
