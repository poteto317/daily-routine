import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { MealRecord, MealType } from "@/types/routine";
import { addMealRecord, getMealHistory, getTodayMealRecords } from "./storage";
import { createMealAddHandler } from "./mealPageStateActions";
import { getTodayDateString } from "./utils/mealFormat";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type UseMealAddActionParams = {
  mealTypeInput: MealType;
  timeInput: string;
  descriptionInput: string;
  notesInput: string;
  setTodayMeals: SetValue<MealRecord[]>;
  setRecentMeals: SetValue<MealRecord[]>;
  setShowForm: SetValue<boolean>;
  setDescriptionInput: SetValue<string>;
  setNotesInput: SetValue<string>;
};

export const useMealAddAction = ({
  mealTypeInput,
  timeInput,
  descriptionInput,
  notesInput,
  setTodayMeals,
  setRecentMeals,
  setShowForm,
  setDescriptionInput,
  setNotesInput,
}: UseMealAddActionParams) => {
  return useCallback(() => {
    createMealAddHandler({
      // 保存する日付は、保存を押した時点の今日で決める。描画時の今日をハンドラに持たせると、
      // フォームを開いたまま 0 時をまたいで再描画が無いまま保存したとき、前日で保存される
      today: getTodayDateString(),
      mealTypeInput,
      timeInput,
      descriptionInput,
      notesInput,
      addMeal: addMealRecord,
      getTodayMealRecords,
      getMealHistory,
      setTodayMeals,
      setRecentMeals,
      setShowForm,
      setDescriptionInput,
      setNotesInput,
    })();
  }, [
    descriptionInput,
    mealTypeInput,
    notesInput,
    setDescriptionInput,
    setNotesInput,
    setRecentMeals,
    setShowForm,
    setTodayMeals,
    timeInput,
  ]);
};
