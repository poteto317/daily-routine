import texts from "../locales/ja.json";

type Props = {
  /** キーの発行有無。null は確認中 */
  hasKey: boolean | null;
  isWorking: boolean;
  onIssue: () => void;
  onRevoke: () => void;
};

export const ApiKeyActionButtons = ({
  hasKey,
  isWorking,
  onIssue,
  onRevoke,
}: Props) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <button
      type="button"
      onClick={onIssue}
      disabled={isWorking || hasKey === null}
      className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {hasKey ? texts.reissueButton : texts.issueButton}
    </button>
    {hasKey && (
      <button
        type="button"
        onClick={onRevoke}
        disabled={isWorking}
        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {texts.revokeButton}
      </button>
    )}
  </div>
);
