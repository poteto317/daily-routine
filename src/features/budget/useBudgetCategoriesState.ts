import { useState } from "react";
import type { BudgetCategory } from "@/types/routine";
import { getBudgetCategories } from "./storage";

export const useBudgetCategoriesState = () => {
  const [categories] = useState<BudgetCategory[]>(() => getBudgetCategories());

  return { categories };
};
