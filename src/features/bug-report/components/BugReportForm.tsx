import type { BugReportSubmitStatus } from "../hooks/useBugReportSubmitStatus";
import { BugReportFeedback } from "./BugReportFeedback";
import texts from "../locales/ja.json";

type Props = {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  stepsToReproduce: string;
  setStepsToReproduce: (value: string) => void;
  status: BugReportSubmitStatus;
  errorMessage: string;
  handleSubmit: () => Promise<void>;
};

const inputClassName =
  "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-400 bg-white dark:bg-slate-50 text-gray-900 dark:text-black focus:outline-none focus:ring-2 focus:ring-blue-500";

/**
 * 不具合報告の入力フォーム（プレゼンテーション）。状態は親から受け取る。
 * フィードバックメッセージは BugReportFeedback に委譲する。
 */
export const BugReportForm = ({
  title,
  setTitle,
  description,
  setDescription,
  stepsToReproduce,
  setStepsToReproduce,
  status,
  errorMessage,
  handleSubmit,
}: Props) => {
  const isSubmitting = status === "submitting";

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="bug-title" className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
          {texts.form.titleLabel}
        </label>
        <input
          id="bug-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={texts.form.titlePlaceholder}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="bug-description" className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
          {texts.form.descriptionLabel}
        </label>
        <textarea
          id="bug-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={texts.form.descriptionPlaceholder}
          rows={4}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="bug-steps" className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-1">
          {texts.form.stepsLabel}
        </label>
        <textarea
          id="bug-steps"
          value={stepsToReproduce}
          onChange={(e) => setStepsToReproduce(e.target.value)}
          placeholder={texts.form.stepsPlaceholder}
          rows={3}
          className={inputClassName}
        />
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-600">
        {texts.form.privacyNote}
      </p>

      <BugReportFeedback status={status} errorMessage={errorMessage} />

      <button
        type="button"
        onClick={() => { void handleSubmit(); }}
        disabled={isSubmitting}
        className="w-full px-4 py-3 rounded-lg font-medium transition-all bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? texts.form.submittingLabel : texts.form.submitLabel}
      </button>
    </div>
  );
};
