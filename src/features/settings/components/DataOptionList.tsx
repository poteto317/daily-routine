import {
  type TransferOptions,
  ALL_TRANSFER_OPTIONS,
  EMPTY_TRANSFER_OPTIONS,
} from "../state/constants";
import {
  DATA_OPTION_ITEMS,
  getUpdatedTransferOptions,
} from "../helpers/dataManagement";
import texts from "../locales/ja.json";

type Props = {
  options: TransferOptions;
  setOptions: (options: TransferOptions) => void;
};

export const DataOptionList = ({ options, setOptions }: Props) => {
  return (
    <div className="space-y-2 mb-3">
      {DATA_OPTION_ITEMS.map((item) => (
        <label
          key={item.key}
          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-800"
        >
          <input
            type="checkbox"
            checked={options[item.key]}
            onChange={(e) =>
              setOptions(
                getUpdatedTransferOptions(options, item.key, e.target.checked),
              )
            }
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span>{item.label}</span>
        </label>
      ))}
      <div className="flex gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-300">
        <button
          type="button"
          onClick={() => setOptions(ALL_TRANSFER_OPTIONS)}
          className="flex-1 px-3 py-2 text-xs bg-blue-100 dark:bg-blue-200 text-blue-700 dark:text-blue-800 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-300 transition-colors font-medium"
        >
          {texts.dataOption.selectAll}
        </button>
        <button
          type="button"
          onClick={() => setOptions(EMPTY_TRANSFER_OPTIONS)}
          className="flex-1 px-3 py-2 text-xs bg-gray-100 dark:bg-gray-200 text-gray-700 dark:text-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-300 transition-colors font-medium"
        >
          {texts.dataOption.deselectAll}
        </button>
      </div>
    </div>
  );
};
