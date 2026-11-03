import type { JournalEntry } from "@/types/routine";
import { CardPanel } from "@/components";
import { formatJournalDate, JOURNAL_MIN_DATE } from "../utils/journalDate";
import journalTexts from "../locales/ja.json";
import { resolveJournalDateFieldValue } from "../journalFormDate";

type JournalEditCardProps = {
  editingEntry: JournalEntry;
  dateInput: string | null;
  today: string;
  titleInput: string;
  contentInput: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onUpdate: () => void;
  onCancel: () => void;
};

export const JournalEditCard = ({
  editingEntry,
  dateInput,
  today,
  titleInput,
  contentInput,
  onTitleChange,
  onContentChange,
  onDateChange,
  onUpdate,
  onCancel,
}: JournalEditCardProps) => {
  return (
    <CardPanel>
      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-100 rounded-lg">
        {/* 見出しは編集前の日付のまま（日付欄を変えても変えない） */}
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-900 mb-4">
          {formatJournalDate(editingEntry.date)}
          {journalTexts.editCard.editingLabel}
        </h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="edit-journal-date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1"
            >
              {journalTexts.editCard.dateInputLabel}
            </label>
            {/* 再読み込みで dateInput が null に戻っても、編集前の日付として扱う */}
            <input
              id="edit-journal-date"
              type="date"
              value={resolveJournalDateFieldValue(
                dateInput,
                editingEntry,
                today,
              )}
              min={JOURNAL_MIN_DATE}
              max={today}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-white dark:text-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="edit-journal-title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1"
            >
              {journalTexts.editCard.titleInputLabel}
            </label>
            <input
              id="edit-journal-title"
              type="text"
              value={titleInput}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-white dark:text-gray-900"
              placeholder={journalTexts.editCard.titlePlaceholder}
            />
          </div>

          <div>
            <label
              htmlFor="edit-journal-content"
              className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1"
            >
              {journalTexts.editCard.contentInputLabel}
            </label>
            <textarea
              id="edit-journal-content"
              value={contentInput}
              onChange={(e) => onContentChange(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-white dark:text-gray-900"
              placeholder={journalTexts.editCard.contentPlaceholder}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onUpdate}
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              {journalTexts.editCard.updateLabel}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-400 text-gray-700 dark:text-gray-900 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
            >
              {journalTexts.editCard.cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </CardPanel>
  );
};
