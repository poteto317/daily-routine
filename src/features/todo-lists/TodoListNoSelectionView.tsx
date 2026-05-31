"use client";

import { CardPanel } from "@/components";
import texts from "./locales/ja.json";

/**
 * Todoリストが未選択のときに表示するビュー。
 * TodoListsPage と TodoListDetail のフォールバックで共用。
 */
export const TodoListNoSelectionView = () => (
  <div className="min-h-screen bg-linear-to-br from-teal-50 to-cyan-100 dark:from-slate-400 dark:to-slate-300">
    <main className="max-w-2xl mx-auto px-4 py-8">
      <CardPanel>
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-4xl mb-3">📝</p>
          <p className="font-medium">{texts.page.emptyMessage}</p>
          <p className="text-sm mt-1">{texts.page.emptyHint}</p>
        </div>
      </CardPanel>
    </main>
  </div>
);
