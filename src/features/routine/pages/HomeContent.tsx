"use client";

import { RoutineForm } from "@/features/routine";
import { RoutineList } from "./RoutineList";
import { HomeToolbar } from "./HomeToolbar";
import type { HomeContentViewModel as HomeContentProps } from "./homeContentViewModel";

/** ホーム画面のメインコンテンツ */
export const HomeContent = ({
  toolbarProps,
  routineListProps,
  routineFormProps,
  showRoutineForm,
}: HomeContentProps) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <HomeToolbar {...toolbarProps} />

        <div className="space-y-3">
          <RoutineList {...routineListProps} />
        </div>
      </main>

      {showRoutineForm && (
        <RoutineForm
          routine={routineFormProps.routine}
          onSubmit={routineFormProps.onSubmitAction}
          onCancel={routineFormProps.onCancelAction}
          currentDayOfWeek={routineFormProps.currentDayOfWeek}
        />
      )}
    </div>
  );
};
