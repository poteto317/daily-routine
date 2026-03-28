import type { Dispatch, SetStateAction } from "react";
import type { MoodType, WorkTemplate } from "@/types/routine";

type WorkTrackerSessionInputStateResultInput = {
  workName: string;
  setWorkName: Dispatch<SetStateAction<string>>;
  notes: string;
  setNotes: Dispatch<SetStateAction<string>>;
  selectedMood: MoodType;
  setSelectedMood: Dispatch<SetStateAction<MoodType>>;
  selectedTemplate: WorkTemplate | null;
  setSelectedTemplate: Dispatch<SetStateAction<WorkTemplate | null>>;
};

export const createWorkTrackerSessionInputStateResult = ({
  workName,
  setWorkName,
  notes,
  setNotes,
  selectedMood,
  setSelectedMood,
  selectedTemplate,
  setSelectedTemplate,
}: WorkTrackerSessionInputStateResultInput) => ({
  workName,
  setWorkName,
  notes,
  setNotes,
  selectedMood,
  setSelectedMood,
  selectedTemplate,
  setSelectedTemplate,
});
