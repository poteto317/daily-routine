"use client";

import { CardPanel } from "@/components";
import { MealHeader } from "./components/MealHeader";
import { MealInputForm } from "./components/MealInputForm";
import { MealRecentSection } from "./components/MealRecentSection";
import { MealTodaySection } from "./components/MealTodaySection";
import { useMealPageState } from "./useMealPageState";

export const MealPage = () => {
  const state = useMealPageState();

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-yellow-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <CardPanel>
          <MealHeader />
          <MealTodaySection
            today={state.today}
            meals={state.todayMeals}
            showForm={state.showForm}
            onOpenForm={state.openForm}
            onDeleteMeal={state.handleDeleteMeal}
            form={
              <MealInputForm
                mealTypeInput={state.mealTypeInput}
                timeInput={state.timeInput}
                descriptionInput={state.descriptionInput}
                notesInput={state.notesInput}
                onMealTypeChange={state.setMealTypeInput}
                onTimeChange={state.setTimeInput}
                onDescriptionChange={state.setDescriptionInput}
                onNotesChange={state.setNotesInput}
                onSave={state.handleAddMeal}
                onCancel={state.handleCancelForm}
              />
            }
          />
        </CardPanel>
        <MealRecentSection
          meals={state.recentMeals}
          today={state.today}
          onDeleteMeal={state.handleDeleteMeal}
        />
      </main>
    </div>
  );
};
