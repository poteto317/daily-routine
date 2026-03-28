import { useState } from "react";
import type { RoutineCategory } from "@/types/routine";

type UseRoutineMetaFieldsStateParams = {
  initialTitle: string;
  initialCategory: RoutineCategory;
  initialDescription: string;
};

export const useRoutineMetaFieldsState = ({
  initialTitle,
  initialCategory,
  initialDescription,
}: UseRoutineMetaFieldsStateParams) => {
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState<RoutineCategory>(initialCategory);
  const [description, setDescription] = useState(initialDescription);

  return {
    title,
    setTitle,
    category,
    setCategory,
    description,
    setDescription,
  };
};
