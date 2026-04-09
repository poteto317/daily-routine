import type { MealRecord, MealType } from "@/types/routine";
import { generateId } from "@/lib/storage/core";
import { getMealHistory, saveMealHistory } from "./storageData";

export const addMealRecord = (
  date: string,
  mealType: MealType,
  time: string,
  description: string,
  options?: { calories?: number; notes?: string; photo?: string },
): void => {
  const history = getMealHistory();
  if (!history[date]) {
    history[date] = [];
  }

  const now = new Date().toISOString();
  history[date].push({
    id: generateId("meal"),
    date,
    mealType,
    time,
    description,
    calories: options?.calories,
    notes: options?.notes,
    photo: options?.photo,
    createdAt: now,
    updatedAt: now,
  });

  saveMealHistory(history);
};

export const updateMealRecord = (
  date: string,
  mealId: string,
  updates: Partial<Omit<MealRecord, "id" | "date" | "createdAt">>,
): void => {
  const history = getMealHistory();
  const records = history[date];
  if (!records) return;

  const index = records.findIndex((record) => record.id === mealId);
  if (index === -1) return;

  history[date][index] = {
    ...records[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveMealHistory(history);
};

export const deleteMealRecord = (date: string, mealId: string): void => {
  const history = getMealHistory();
  const records = history[date];
  if (!records) return;

  history[date] = records.filter((record) => record.id !== mealId);
  if (history[date].length === 0) {
    delete history[date];
  }

  saveMealHistory(history);
};
