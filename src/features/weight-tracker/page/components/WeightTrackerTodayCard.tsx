import { type WeightRecord } from "@/types/routine";
import { formatWeightDate } from "../weightRecordQueries";
import {
  formatWeightTodayNote,
  getWeightTodayEditButtonLabel,
  WEIGHT_TODAY_EMPTY_LABEL,
  WEIGHT_TODAY_TITLE,
  WEIGHT_TODAY_UPDATED_AT_LABEL,
} from "../weightTodayPresentation";
import { WeightTrackerForm } from "./WeightTrackerForm";

type WeightTrackerTodayCardProps = {
  today: string;
  todayRecord: WeightRecord | null;
  showForm: boolean;
  weightInput: string;
  notesInput: string;
  onEdit: () => void;
  onWeightChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export const WeightTrackerTodayCard = ({
  today,
  todayRecord,
  showForm,
  weightInput,
  notesInput,
  onEdit,
  onWeightChange,
  onNotesChange,
  onSave,
  onCancel,
}: WeightTrackerTodayCardProps) => {
  return (
    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-100 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-900">
          {WEIGHT_TODAY_TITLE} ({formatWeightDate(today)})
        </h2>
        {!showForm && (
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {getWeightTodayEditButtonLabel(Boolean(todayRecord))}
          </button>
        )}
      </div>

      {showForm ? (
        <WeightTrackerForm
          weightInput={weightInput}
          notesInput={notesInput}
          onWeightChange={onWeightChange}
          onNotesChange={onNotesChange}
          onSave={onSave}
          onCancel={onCancel}
        />
      ) : todayRecord ? (
        <div className="mt-4">
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-700 mb-2">
            {todayRecord.weight.toFixed(1)} kg
          </div>
          {todayRecord.notes && (
            <p className="text-sm text-gray-600 dark:text-gray-700 mb-2">
              {formatWeightTodayNote(todayRecord.notes)}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-600">
            {WEIGHT_TODAY_UPDATED_AT_LABEL}{" "}
            {new Date(todayRecord.updatedAt).toLocaleString("ja-JP")}
          </p>
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-600 py-4">
          {WEIGHT_TODAY_EMPTY_LABEL}
        </div>
      )}
    </div>
  );
};
