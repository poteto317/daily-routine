import type { MoodType, WorkTemplate } from "@/types/routine";

type SetValue<T> = (value: T) => void;

export const createWorkTrackerResetFormAction = (params: {
  setWorkName: SetValue<string>;
  setNotes: SetValue<string>;
  setSelectedMood: SetValue<MoodType>;
  setSelectedTemplate: SetValue<WorkTemplate | null>;
  setElapsedTime: SetValue<number>;
  setShowInputForm: SetValue<boolean>;
  setShowTemplateDropdown: SetValue<boolean>;
  clearStartTime: () => void;
}) => {
  return () => {
    const {
      setWorkName,
      setNotes,
      setSelectedMood,
      setSelectedTemplate,
      setElapsedTime,
      setShowInputForm,
      setShowTemplateDropdown,
      clearStartTime,
    } = params;

    setWorkName("");
    setNotes("");
    setSelectedMood("normal");
    setSelectedTemplate(null);
    setElapsedTime(0);
    setShowInputForm(false);
    setShowTemplateDropdown(false);
    clearStartTime();
  };
};