"use client";

import { CardPanel } from "@/components";
import { JournalRecentEntries } from "./components/JournalRecentEntries";
import { JournalTodayCard } from "./components/JournalTodayCard";
import { useJournalPageState } from "./useJournalPageState";
import journalTexts from "./locales/ja.json";

export const JournalPage = () => {
  const state = useJournalPageState();

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <CardPanel>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {journalTexts.page.title}
          </h1>
          <JournalTodayCard
            today={state.today}
            todayEntry={state.todayEntry}
            showForm={state.showForm}
            titleInput={state.titleInput}
            contentInput={state.contentInput}
            onOpenForm={state.openForm}
            onTitleChange={state.setTitleInput}
            onContentChange={state.setContentInput}
            onSave={state.handleSaveEntry}
            onCancel={state.handleCancelForm}
          />
        </CardPanel>

        <JournalRecentEntries
          entries={state.recentEntries}
          onDeleteEntry={state.handleDeleteEntry}
        />
      </main>
    </div>
  );
};
