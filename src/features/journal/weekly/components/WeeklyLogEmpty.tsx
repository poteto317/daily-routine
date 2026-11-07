import journalTexts from "../../locales/ja.json";

const texts = journalTexts.weeklyLog;

type WeeklyLogEmptyProps = {
  onStartEditing: () => void;
};

export const WeeklyLogEmpty = ({ onStartEditing }: WeeklyLogEmptyProps) => (
  <div className="text-center py-6">
    <p className="text-gray-500 dark:text-gray-600 mb-3">{texts.emptyLabel}</p>
    <button
      type="button"
      onClick={onStartEditing}
      className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
    >
      {texts.addButtonLabel}
    </button>
  </div>
);
