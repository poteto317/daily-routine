import type { BugReportSubmitStatus } from "../hooks/useBugReportSubmitStatus";
import texts from "../locales/ja.json";

type Props = {
  status: BugReportSubmitStatus;
  errorMessage: string;
};

/**
 * 不具合報告の送信フィードバック（エラー / 成功メッセージ）を表示するプレゼンテーションコンポーネント。
 * 入力フォームとは別の責務として分離する。
 */
export const BugReportFeedback = ({ status, errorMessage }: Props) => {
  if (status === "error" && errorMessage) {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-700">
        {errorMessage}
      </p>
    );
  }
  if (status === "success") {
    return (
      <p role="status" className="text-sm text-green-600 dark:text-green-700">
        {texts.status.success}
      </p>
    );
  }
  return null;
};
