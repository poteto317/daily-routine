export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MealRecord {
  id: string;
  date: string;
  mealType: MealType;
  time: string;
  description: string;
  photo?: string;
  calories?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MealHistory {
  [date: string]: MealRecord[];
}
