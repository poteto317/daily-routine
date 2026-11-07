import { useId } from "react";
import journalTexts from "../../locales/ja.json";

const texts = journalTexts.weeklyLog;

type WeeklyLogFormProps = {
  contentInput: string;
  onContentChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export const WeeklyLogForm = ({
  contentInput,
  onContentChange,
  onSave,
  onCancel,
}: WeeklyLogFormProps) => {
  const textareaId = useId();

  // form の submit を使わない（IME 確定の Enter で送信しない）
  return (
    <div className="space-y-3">
      <label
        htmlFor={textareaId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-800"
      >
        {texts.contentInputLabel}
      </label>
      <textarea
        id={textareaId}
        value={contentInput}
        onChange={(event) => onContentChange(event.target.value)}
        placeholder={texts.contentPlaceholder}
        rows={8}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white dark:bg-white dark:text-gray-900"
      />
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-400 text-gray-700 dark:text-gray-900 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
        >
          {texts.cancelLabel}
        </button>
        <button
          type="button"
          onClick={onSave}
          className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          {texts.saveLabel}
        </button>
      </div>
    </div>
  );
};
