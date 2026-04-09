import { type JournalEntry } from "@/types/routine";
import { CardPanel } from "@/components";
import { formatJournalDate, formatUpdatedAt } from "../utils/journalDate";
import journalTexts from "../locales/ja.json";

type JournalRecentEntriesProps = {
  entries: JournalEntry[];
  onDeleteEntry: (entry: JournalEntry) => void;
  onEditEntry: (entry: JournalEntry) => void;
};

export const JournalRecentEntries = ({
  entries,
  onDeleteEntry,
  onEditEntry,
}: JournalRecentEntriesProps) => {
  return (
    <CardPanel className="mb-0!">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {journalTexts.recentEntries.title}
      </h2>

      {entries.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-600 text-center py-8">
          {journalTexts.recentEntries.empty}
        </p>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-4 border border-gray-200 dark:border-gray-300 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-700">
                      {formatJournalDate(entry.date)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-900">
                    {entry.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditEntry(entry)}
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-700 dark:hover:text-purple-800 text-sm font-medium"
                  >
                    {journalTexts.recentEntries.edit}
                  </button>
                  <button
                    onClick={() => onDeleteEntry(entry)}
                    className="text-red-600 hover:text-red-700 dark:text-red-700 dark:hover:text-red-800 text-sm font-medium"
                  >
                    {journalTexts.recentEntries.delete}
                  </button>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-800 whitespace-pre-wrap line-clamp-3">
                {entry.content}
              </p>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-600">
                {journalTexts.recentEntries.updatedPrefix}{" "}
                {formatUpdatedAt(entry.updatedAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </CardPanel>
  );
};
