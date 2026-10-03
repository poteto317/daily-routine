import texts from "../locales/ja.json";

type Props = {
  issuedKey: string;
  copied: boolean;
  onCopy: () => void;
};

/** 発行直後に 1 回だけ表示するキーと、コピー操作 */
export const IssuedApiKeyPanel = ({ issuedKey, copied, onCopy }: Props) => (
  <div className="mt-3">
    <p className="p-2 bg-yellow-100 dark:bg-yellow-200 border border-yellow-300 rounded text-xs text-yellow-800 dark:text-yellow-900">
      {texts.issuedNotice}
    </p>
    <label className="block mt-3 text-xs text-gray-600 dark:text-gray-700">
      {texts.issuedKeyLabel}
      <input
        readOnly
        value={issuedKey}
        onFocus={(event) => event.currentTarget.select()}
        className="mt-1 w-full rounded border border-gray-300 bg-white p-2 font-mono text-xs text-gray-900"
      />
    </label>
    <button
      type="button"
      onClick={onCopy}
      className="mt-2 rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
    >
      {texts.copyButton}
    </button>
    {/* スクリーンリーダーに結果が伝わるよう、領域は常に置いて中身だけ切り替える */}
    <span
      role="status"
      aria-live="polite"
      className="ml-2 text-xs text-emerald-700"
    >
      {copied ? texts.copiedLabel : ""}
    </span>
  </div>
);
