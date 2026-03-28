"use client";

import { CardPanel } from "@/components";
import { WorkTrackerHeader } from "./components/WorkTrackerHeader";
import { WorkTrackerSessionForm } from "./components/WorkTrackerSessionForm";
import { WorkTrackerSessionHistory } from "./components/WorkTrackerSessionHistory";
import { WorkTrackerTimerPanel } from "./components/WorkTrackerTimerPanel";
import { WorkTrackerTodaySummary } from "./components/WorkTrackerTodaySummary";
import { getTotalTimeToday } from "./helpers";
import { useWorkTrackerPageState } from "./useWorkTrackerPageState";

export const WorkTrackerPage = () => {
  const state = useWorkTrackerPageState();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <CardPanel className="p-8! mb-0!">
          <WorkTrackerHeader />
          <WorkTrackerTodaySummary
            totalTime={getTotalTimeToday(state.sessions)}
            sessionsCount={state.sessions.length}
          />
          <WorkTrackerTimerPanel
            isRunning={state.isRunning}
            elapsedTime={state.elapsedTime}
            showInputForm={state.showInputForm}
            onStart={state.startTimer}
            onStop={state.stopTimer}
          />
          {state.showInputForm && (
            <WorkTrackerSessionForm
              elapsedTime={state.elapsedTime}
              workName={state.workName}
              notes={state.notes}
              selectedMood={state.selectedMood}
              selectedTemplate={state.selectedTemplate}
              templates={state.templates}
              showTemplateDropdown={state.showTemplateDropdown}
              setWorkName={state.setWorkName}
              setNotes={state.setNotes}
              setSelectedMood={state.setSelectedMood}
              setSelectedTemplate={state.setSelectedTemplate}
              setShowTemplateDropdown={state.setShowTemplateDropdown}
              onSave={state.handleSaveSession}
              onCancel={state.handleCancelSession}
            />
          )}
          <WorkTrackerSessionHistory
            sessions={state.sessions}
            onDeleteSession={state.handleDeleteSession}
          />
        </CardPanel>
      </main>
    </div>
  );
};
