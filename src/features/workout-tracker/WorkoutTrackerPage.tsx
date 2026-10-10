"use client";

import { CardPanel } from "@/components";
import texts from "./locales/ja.json";
import { WorkoutExerciseManager } from "./page/components/WorkoutExerciseManager";
import { WorkoutRecordForm } from "./page/components/WorkoutRecordForm";
import { WorkoutRecordHistoryList } from "./page/components/WorkoutRecordHistoryList";
import { useWorkoutTrackerPageState } from "./page/useWorkoutTrackerPageState";

/**
 * 運動記録ページコンポーネント。
 * 筋トレ・ランニングの記録を追加・一覧表示・削除する機能を提供する。
 */
export const WorkoutTrackerPage = () => {
  const {
    exercises,
    exerciseActions,
    formValues,
    formError,
    groups,
    setLabel,
    setDate,
    setExerciseId,
    setWeightKg,
    setReps,
    setSets,
    setCaloriesBurned,
    onSubmitAction,
    onDeleteRecordAction,
  } = useWorkoutTrackerPageState();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <CardPanel>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {texts.page.title}
          </h1>

          <div className="mb-6">
            <WorkoutRecordForm
              exercises={exercises}
              values={formValues}
              error={formError}
              onChangeLabelAction={setLabel}
              onChangeDateAction={setDate}
              onChangeExerciseIdAction={setExerciseId}
              onChangeWeightKgAction={setWeightKg}
              onChangeRepsAction={setReps}
              onChangeSetsAction={setSets}
              onChangeCaloriesBurnedAction={setCaloriesBurned}
              onSubmitAction={onSubmitAction}
            />
          </div>

          <WorkoutExerciseManager
            label={formValues.label}
            exercises={exercises}
            actions={exerciseActions}
          />

          <WorkoutRecordHistoryList
            groups={groups}
            onDeleteRecordAction={onDeleteRecordAction}
          />
        </CardPanel>
      </main>
    </div>
  );
};
