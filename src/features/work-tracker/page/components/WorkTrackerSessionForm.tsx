import { MoodType, WorkTemplate } from "@/types/routine";
import { WorkTrackerMoodSelector } from "./WorkTrackerMoodSelector";
import { WorkTrackerNotesField } from "./WorkTrackerNotesField";
import { WorkTrackerTemplateInput } from "./WorkTrackerTemplateInput";
import { WorkTrackerTemplateInsights } from "./WorkTrackerTemplateInsights";
import workTrackerTexts from "../../locales/ja.json";

type Props = {
  elapsedTime: number;
  workName: string;
  notes: string;
  selectedMood: MoodType;
  selectedTemplate: WorkTemplate | null;
  templates: WorkTemplate[];
  showTemplateDropdown: boolean;
  setWorkName: (value: string) => void;
  setNotes: (value: string) => void;
  setSelectedMood: (value: MoodType) => void;
  setSelectedTemplate: (template: WorkTemplate | null) => void;
  setShowTemplateDropdown: (value: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
};

export const WorkTrackerSessionForm = ({
  elapsedTime,
  workName,
  notes,
  selectedMood,
  selectedTemplate,
  templates,
  showTemplateDropdown,
  setWorkName,
  setNotes,
  setSelectedMood,
  setSelectedTemplate,
  setShowTemplateDropdown,
  onSave,
  onCancel,
}: Props) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-200 rounded-xl p-6 mb-8 border-2 border-blue-500">
      <h3 className="text-xl font-bold text-gray-900 dark:text-black mb-4">
        {workTrackerTexts.sessionForm.title}
      </h3>
      <WorkTrackerTemplateInput
        workName={workName}
        templates={templates}
        showTemplateDropdown={showTemplateDropdown}
        setWorkName={setWorkName}
        setSelectedTemplate={setSelectedTemplate}
        setShowTemplateDropdown={setShowTemplateDropdown}
      />
      <WorkTrackerTemplateInsights
        selectedTemplate={selectedTemplate}
        workName={workName}
        elapsedTime={elapsedTime}
      />
      <WorkTrackerNotesField notes={notes} setNotes={setNotes} />
      <WorkTrackerMoodSelector
        selectedMood={selectedMood}
        setSelectedMood={setSelectedMood}
      />
      <div className="flex gap-3">
        <button
          onClick={onSave}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          {workTrackerTexts.sessionForm.saveLabel}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-300 dark:bg-gray-400 text-gray-700 dark:text-gray-900 rounded-lg font-bold hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
        >
          {workTrackerTexts.sessionForm.cancelLabel}
        </button>
      </div>
    </div>
  );
};
