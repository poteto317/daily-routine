"use client";

import { useBugReportForm } from "../hooks/useBugReportForm";
import { BugReportForm } from "./BugReportForm";
import texts from "../locales/ja.json";

/**
 * 設定画面に差し込む「不具合を報告」セクション。
 * フォームの状態管理フックと表示コンポーネントを結合する。
 */
export const BugReportSection = () => {
  const form = useBugReportForm();

  return (
    <div className="pt-6 border-t border-gray-200 dark:border-gray-300">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-black mb-1">
        {texts.section.title}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-600 mb-4">
        {texts.section.description}
      </p>
      <BugReportForm
        title={form.title}
        setTitle={form.setTitle}
        description={form.description}
        setDescription={form.setDescription}
        stepsToReproduce={form.stepsToReproduce}
        setStepsToReproduce={form.setStepsToReproduce}
        status={form.status}
        errorMessage={form.errorMessage}
        handleSubmit={form.handleSubmit}
      />
    </div>
  );
};
