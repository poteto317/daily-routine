import { useState } from "react";
import type { RoutineCategory } from "@/types/routine";

type UseRoutineMetaFieldsStateParams = {
  initialTitle: string;
  initialCategory: RoutineCategory;
  initialDescription: string;
  initialWeeklyGoalTarget: string;
};

export const useRoutineMetaFieldsState = ({
  initialTitle,
  initialCategory,
  initialDescription,
  initialWeeklyGoalTarget,
}: UseRoutineMetaFieldsStateParams) => {
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState<RoutineCategory>(initialCategory);
  const [description, setDescription] = useState(initialDescription);
  const [weeklyGoalTarget, setWeeklyGoalTarget] = useState(
    initialWeeklyGoalTarget,
  );

  return {
    title,
    setTitle,
    category,
    setCategory,
    description,
    setDescription,
    weeklyGoalTarget,
    setWeeklyGoalTarget,
  };
};
