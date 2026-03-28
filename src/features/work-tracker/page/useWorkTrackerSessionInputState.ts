import { useState } from "react";
import type { MoodType, WorkTemplate } from "@/types/routine";
import { createWorkTrackerSessionInputStateResult } from "./workTrackerSessionInputStateResult";

type UseWorkTrackerSessionInputStateParams = {
  initialWorkName: string;
  initialNotes: string;
  initialSelectedMood: MoodType;
  initialSelectedTemplate: WorkTemplate | null;
};

export const useWorkTrackerSessionInputState = ({
  initialWorkName,
  initialNotes,
  initialSelectedMood,
  initialSelectedTemplate,
}: UseWorkTrackerSessionInputStateParams) => {
  const [workName, setWorkName] = useState(initialWorkName);
  const [notes, setNotes] = useState(initialNotes);
  const [selectedMood, setSelectedMood] =
    useState<MoodType>(initialSelectedMood);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkTemplate | null>(
    initialSelectedTemplate,
  );

  return createWorkTrackerSessionInputStateResult({
    notes,
    selectedMood,
    selectedTemplate,
    setNotes,
    setSelectedMood,
    setSelectedTemplate,
    setWorkName,
    workName,
  });
};
