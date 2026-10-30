"use client";

import { CardPanel } from "@/components";
import { useBugReportForm } from "../hooks/useBugReportForm";
import { BugReportForm } from "./BugReportForm";
import texts from "../locales/ja.json";

/** 不具合を報告するための独立ページ（ハンバーガーメニューから遷移） */
export const BugReportPage = () => {
  const form = useBugReportForm();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <CardPanel>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-black mb-1">
            {texts.page.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-600 mb-6">
            {texts.page.description}
          </p>
          <BugReportForm
            description={form.description}
            setDescription={form.setDescription}
            stepsToReproduce={form.stepsToReproduce}
            setStepsToReproduce={form.setStepsToReproduce}
            imageAttachments={form.imageAttachments}
            status={form.status}
            errorMessage={form.errorMessage}
            handleSubmit={form.handleSubmit}
          />
        </CardPanel>
      </main>
    </div>
  );
};
