import { useState } from "react";
import { useJstTodayKey } from "@/hooks/useToday";
import type { MealRecord } from "@/types/routine";
import { getMealHistory, getTodayMealRecords } from "./storage";
import { getCurrentTimeString } from "./utils/mealFormat";
import { createInitialMealViewState } from "./mealViewStateActions";

export const useMealPageDataState = () => {
  const today = useJstTodayKey();
  const initialState = createInitialMealViewState({
    todayMeals: getTodayMealRecords(),
    mealHistory: getMealHistory(),
    currentTime: getCurrentTimeString(),
  });

  const [todayMeals, setTodayMeals] = useState<MealRecord[]>(
    initialState.todayMeals,
  );
  const [recentMeals, setRecentMeals] = useState<MealRecord[]>(
    initialState.recentMeals,
  );

  return {
    initialState,
    recentMeals,
    setRecentMeals,
    setTodayMeals,
    today,
    todayMeals,
  };
};
