import { getApiKeyStatusLabel } from "../helpers";
import texts from "../locales/ja.json";

type Props = {
  /** キーの発行有無。null は確認中 */
  hasKey: boolean | null;
};

export const ApiKeyStatusRow = ({ hasKey }: Props) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-gray-700 dark:text-gray-800">
      {texts.statusLabel}
    </span>
    <span className="text-sm text-gray-900 dark:text-black">
      {getApiKeyStatusLabel(hasKey)}
    </span>
  </div>
);
