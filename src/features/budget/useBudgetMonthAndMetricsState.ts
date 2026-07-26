import { useBudgetAllowanceState } from "./useBudgetAllowanceState";
import { useBudgetMonthState } from "./useBudgetMonthState";
import { useBudgetPageInitialState } from "./useBudgetPageInitialState";
import { useBudgetPageMetricsState } from "./useBudgetPageMetricsState";

/**
 * 家計簿トップページ（useBudgetPageState）と月次サマリーページ
 * （useBudgetSummaryPageState）の双方で共通して必要となる
 * 「初期状態 → 月ごとの支出取得 → 月次メトリクス計算」の一連の処理をまとめる。
 * ページ固有の状態合成（フォーム状態・編集状態・ナビゲーション等）は
 * 呼び出し側の責務とする。
 */
export const useBudgetMonthAndMetricsState = () => {
  const initialState = useBudgetPageInitialState();
  const monthState = useBudgetMonthState({ initialState });
  const { monthlyAllowance } = useBudgetAllowanceState();
  const metrics = useBudgetPageMetricsState({
    currentDate: monthState.currentDate,
    monthBudget: monthlyAllowance.allowance,
    expenses: monthState.expenses,
  });

  return { initialState, monthState, monthlyAllowance, metrics };
};
