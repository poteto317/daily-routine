import budgetTexts from "../locales/ja.json";

type BudgetZeroAmountNoticeProps = {
  id: string;
  /** 0 円が拒否される組み合わせ（今日以降の日付）のときだけ表示する */
  visible: boolean;
};

/** 0 円が保存できない理由を、金額欄の近くに伝える（スクリーンリーダーにも通知する）。 */
export const BudgetZeroAmountNotice = ({
  id,
  visible,
}: BudgetZeroAmountNoticeProps) =>
  visible ? (
    <p id={id} role="alert" className="mt-1 text-xs text-red-600">
      {budgetTexts.expenseForm.zeroAmountNotAllowed}
    </p>
  ) : null;
