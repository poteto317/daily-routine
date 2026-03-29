import { JournalEntry } from "@/types/routine";
import { formatJournalDate } from "../utils/journalDate";
import journalTexts from "../locales/ja.json";
import { getJournalFormOpenButtonLabel } from "../helpers";

type JournalTodayCardProps = {
  contentInput: string;
  editingEntry: JournalEntry | null;
  showForm: boolean;
  titleInput: string;
  today: string;
  todayEntry: JournalEntry | null;
  onCancel: () => void;
  onContentChange: (value: string) => void;
  onEditEntry: (entry: JournalEntry) => void;
  onOpenForm: () => void;
  onSave: () => void;
  onUpdate: () => void;
  onTitleChange: (value: string) => void;
};

export const JournalTodayCard = ({
  contentInput,
  editingEntry,
  showForm,
  titleInput,
  today,
  todayEntry,
  onCancel,
  onContentChange,
  onEditEntry,
  onOpenForm,
  onSave,
  onUpdate,
  onTitleChange,
}: JournalTodayCardProps) => {
  const isEditing = editingEntry !== null;
  return (
    <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-100 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-900">
          {journalTexts.todayCard.titleLabel} ({formatJournalDate(today)})
        </h2>
        {!showForm && (
          <button
            onClick={onOpenForm}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            {getJournalFormOpenButtonLabel()}
          </button>
        )}
      </div>

      {showForm ? (
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
              {journalTexts.todayCard.titleInputLabel}
            </label>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-white dark:text-gray-900"
              placeholder={journalTexts.todayCard.titlePlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
              {journalTexts.todayCard.contentInputLabel}
            </label>
            <textarea
              value={contentInput}
              onChange={(e) => onContentChange(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-white dark:text-gray-900"
              placeholder={journalTexts.todayCard.contentPlaceholder}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={isEditing ? onUpdate : onSave}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              {isEditing
                ? journalTexts.todayCard.updateLabel
                : journalTexts.todayCard.saveLabel}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-400 text-gray-700 dark:text-gray-900 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
            >
              {journalTexts.todayCard.cancelLabel}
            </button>
          </div>
        </div>
      ) : todayEntry ? (
        <div className="mt-4">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-900 mb-2">
              {todayEntry.title}
            </h3>
            <button
              onClick={() => onEditEntry(todayEntry)}
              className="text-purple-600 hover:text-purple-700 dark:text-purple-700 dark:hover:text-purple-800 text-sm font-medium ml-2"
            >
              {journalTexts.todayCard.editButtonLabel}
            </button>
          </div>
          <p className="text-gray-700 dark:text-gray-800 whitespace-pre-wrap">
            {todayEntry.content}
          </p>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-600 text-sm mt-2">
          {journalTexts.todayCard.emptyLabel}
        </p>
      )}
    </div>
  );
};
