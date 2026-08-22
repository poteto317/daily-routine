import {
  WEIGHT_FORM_CANCEL_LABEL,
  WEIGHT_FORM_NOTES_LABEL,
  WEIGHT_FORM_NOTES_PLACEHOLDER,
  WEIGHT_FORM_SAVE_LABEL,
  WEIGHT_FORM_WEIGHT_LABEL,
  WEIGHT_FORM_WEIGHT_PLACEHOLDER,
} from "../weightFormPresentation";

type WeightTrackerFormProps = {
  weightInput: string;
  notesInput: string;
  onWeightChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export const WeightTrackerForm = ({
  weightInput,
  notesInput,
  onWeightChange,
  onNotesChange,
  onSave,
  onCancel,
}: WeightTrackerFormProps) => {
  return (
    <div className="space-y-4 mt-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
          {WEIGHT_FORM_WEIGHT_LABEL}
        </label>
        <input
          type="number"
          step="0.1"
          value={weightInput}
          onChange={(e) => onWeightChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-white dark:text-gray-900"
          placeholder={WEIGHT_FORM_WEIGHT_PLACEHOLDER}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
          {WEIGHT_FORM_NOTES_LABEL}
        </label>
        <textarea
          value={notesInput}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-white dark:text-gray-900"
          placeholder={WEIGHT_FORM_NOTES_PLACEHOLDER}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSave}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {WEIGHT_FORM_SAVE_LABEL}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-200 transition-colors font-medium"
        >
          {WEIGHT_FORM_CANCEL_LABEL}
        </button>
      </div>
    </div>
  );
};
