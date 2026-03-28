import workTrackerTexts from "../../locales/ja.json";

type Props = {
  notes: string;
  setNotes: (value: string) => void;
};

export const WorkTrackerNotesField = ({ notes, setNotes }: Props) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-2">
        {workTrackerTexts.notesField.label}
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={workTrackerTexts.notesField.placeholder}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-white text-gray-900 min-h-20"
        rows={3}
      />
      <p className="text-xs text-gray-500 dark:text-gray-700 mt-1">
        {workTrackerTexts.notesField.helperText}
      </p>
    </div>
  );
};
