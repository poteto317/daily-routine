import { MOOD_OPTIONS, MoodType } from "@/types/routine";
import workTrackerTexts from "../../locales/ja.json";

type Props = {
  selectedMood: MoodType;
  setSelectedMood: (value: MoodType) => void;
};

export const WorkTrackerMoodSelector = ({
  selectedMood,
  setSelectedMood,
}: Props) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-3">
        {workTrackerTexts.moodSelector.label}
      </label>
      <div className="grid grid-cols-5 gap-2">
        {MOOD_OPTIONS.map((mood) => (
          <button
            key={mood.value}
            onClick={() => setSelectedMood(mood.value)}
            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
              selectedMood === mood.value
                ? "border-blue-500 bg-blue-50 dark:bg-blue-100 shadow-md"
                : "border-gray-300 dark:border-gray-400 bg-white dark:bg-gray-100 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
          >
            <span className="text-3xl mb-1">{mood.emoji}</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-900">
              {mood.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
