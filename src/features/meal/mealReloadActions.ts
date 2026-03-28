import type { Dispatch, SetStateAction } from "react";
import type { MealRecord } from "@/types/routine";
import { createReloadedMealViewState } from "./mealViewStateActions";

type MealHistory = Record<string, MealRecord[]>;

type MealStorageReaders = {
  getTodayMealRecords: () => MealRecord[];
  getMealHistory: () => MealHistory;
};

type MealReloadSetters = {
  setTodayMeals: Dispatch<SetStateAction<MealRecord[]>>;
  setRecentMeals: Dispatch<SetStateAction<MealRecord[]>>;
};

const applyReloadedMealViewState = ({
  getTodayMealRecords,
  getMealHistory,
  setTodayMeals,
  setRecentMeals,
}: MealStorageReaders & MealReloadSetters): void => {
  const pageData = createReloadedMealViewState(
    getTodayMealRecords(),
    getMealHistory(),
  );

  setTodayMeals(pageData.todayMeals);
  setRecentMeals(pageData.recentMeals);
};

export const createReloadMealsAction = (
  args: MealStorageReaders & MealReloadSetters,
) => {
  return () => {
    applyReloadedMealViewState(args);
  };
};