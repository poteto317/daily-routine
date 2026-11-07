"use client";

import { CardPanel } from "@/components";
import { JournalEditCard } from "./components/JournalEditCard";
import { JournalRecentEntries } from "./components/JournalRecentEntries";
import { JournalTodayCard } from "./components/JournalTodayCard";
import { WeeklyLogCard } from "./weekly/components/WeeklyLogCard";
import { useWeeklyLogState } from "./weekly/useWeeklyLogState";
import { useJournalPageState } from "./useJournalPageState";
import journalTexts from "./locales/ja.json";

export const JournalPage = () => {
  const state = useJournalPageState();
  const weeklyLogState = useWeeklyLogState();
  const isPastEditing =
    state.editingEntry !== null && state.editingEntry.date !== state.today;

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <CardPanel>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-900 mb-4">
            {journalTexts.page.title}
          </h1>
          <JournalTodayCard
            today={state.today}
            todayEntry={state.todayEntry}
            editingEntry={isPastEditing ? null : state.editingEntry}
            showForm={state.showForm && !isPastEditing}
            titleInput={state.titleInput}
            contentInput={state.contentInput}
            dateInput={state.dateInput}
            onOpenForm={state.openForm}
            onEditEntry={state.openEditForm}
            onTitleChange={state.handleTitleChange}
            onContentChange={state.handleContentChange}
            onDateChange={state.handleDateChange}
            onSave={state.handleSaveEntry}
            onUpdate={state.handleUpdateEntry}
            onCancel={state.handleCancelForm}
          />
        </CardPanel>

        {state.showForm && state.editingEntry && isPastEditing && (
          <JournalEditCard
            editingEntry={state.editingEntry}
            dateInput={state.dateInput}
            today={state.today}
            titleInput={state.titleInput}
            contentInput={state.contentInput}
            onTitleChange={state.handleTitleChange}
            onContentChange={state.handleContentChange}
            onDateChange={state.handleDateChange}
            onUpdate={state.handleUpdateEntry}
            onCancel={state.handleCancelForm}
          />
        )}

        <WeeklyLogCard state={weeklyLogState} />

        <JournalRecentEntries
          entries={state.recentEntries}
          onEditEntry={state.openEditForm}
          onDeleteEntry={state.handleDeleteEntry}
        />
      </main>
    </div>
  );
};
