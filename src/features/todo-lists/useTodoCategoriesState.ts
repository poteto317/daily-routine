import { useState } from "react";
import type { TodoCategory } from "./types";
import { getTodoCategories } from "./storage";

export const useTodoCategoriesState = () => {
  const [categories] = useState<TodoCategory[]>(() => getTodoCategories());

  return { categories };
};
