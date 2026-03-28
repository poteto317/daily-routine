import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { MealRecord } from "@/types/routine";
import { getMealHistory, getTodayMealRecords } from "./storage";
import { createReloadMealsAction } from "./mealPageStateActions";
import { createMealPageReloadActionResult } from "./mealPageReloadActionResult";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type UseMealPageReloadActionParams = {
  setTodayMeals: SetValue<MealRecord[]>;
  setRecentMeals: SetValue<MealRecord[]>;
};

export const useMealPageReloadAction = ({
  setTodayMeals,
  setRecentMeals,
}: UseMealPageReloadActionParams) => {
  const reloadMeals = useCallback(() => {
    createReloadMealsAction({
      getTodayMealRecords,
      getMealHistory,
      setTodayMeals,
      setRecentMeals,
    })();
  }, [setRecentMeals, setTodayMeals]);

  return createMealPageReloadActionResult({ reloadMeals });
};
