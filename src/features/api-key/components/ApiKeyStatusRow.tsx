import { getApiKeyStatusLabel } from "../helpers";
import texts from "../locales/ja.json";

type Props = {
  /** キーの発行有無。null は確認中 */
  hasKey: boolean | null;
};

/**
 * キーの発行状態。初回取得・発行・失効で値が変わるため、フォーカスを移動しなくても
 * スクリーンリーダーに通知されるよう、ラベルと値を含む領域を role=status にする。
 */
export const ApiKeyStatusRow = ({ hasKey }: Props) => (
  <div
    role="status"
    aria-live="polite"
    className="flex items-center justify-between"
  >
    <span className="text-sm font-medium text-gray-700 dark:text-gray-800">
      {texts.statusLabel}
    </span>
    <span className="text-sm text-gray-900 dark:text-black">
      {getApiKeyStatusLabel(hasKey)}
    </span>
  </div>
);
