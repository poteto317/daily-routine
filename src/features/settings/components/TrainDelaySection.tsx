import { MonitoredLine } from "../state/constants";
import { MonitoredLinesList } from "./MonitoredLinesList";
import {
  getLineOptionLabel,
  getTrainDelayThumbClassName,
  getTrainDelayToggleClassName,
  isAddLineButtonDisabled,
} from "../helpers/trainDelay";
import texts from "../locales/ja.json";

type LineOption = { id: string; name: string; company: string };

type Props = {
  trainDelayEnabled: boolean;
  setTrainDelayEnabled: (value: boolean) => void;
  selectedLineInput: string;
  setSelectedLineInput: (value: string) => void;
  availableLines: LineOption[];
  monitoredLines: MonitoredLine[];
  handleAddLine: () => void;
  handleRemoveLine: (lineId: string) => void;
};

export const TrainDelaySection = ({
  trainDelayEnabled,
  setTrainDelayEnabled,
  selectedLineInput,
  setSelectedLineInput,
  availableLines,
  monitoredLines,
  handleAddLine,
  handleRemoveLine,
}: Props) => {
  const addLineDisabled = isAddLineButtonDisabled(selectedLineInput);

  return (
    <div className="border-t dark:border-gray-600 pt-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-black">
          {texts.trainDelay.title}
        </h3>
        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
          Beta
        </span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        {texts.trainDelay.description}
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {texts.trainDelay.toggleLabel}
          </span>
          <button
            type="button"
            onClick={() => setTrainDelayEnabled(!trainDelayEnabled)}
            className={getTrainDelayToggleClassName(trainDelayEnabled)}
          >
            <span className={getTrainDelayThumbClassName(trainDelayEnabled)} />
          </button>
        </div>

        {trainDelayEnabled && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {texts.trainDelay.addLineLabel}
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedLineInput}
                  onChange={(e) => setSelectedLineInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">{texts.trainDelay.selectPlaceholder}</option>
                  {availableLines.map((line) => (
                    <option key={line.id} value={line.id}>
                      {getLineOptionLabel(line)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddLine}
                  disabled={addLineDisabled}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {texts.trainDelay.addButtonLabel}
                </button>
              </div>
            </div>

            <MonitoredLinesList
              monitoredLines={monitoredLines}
              handleRemoveLine={handleRemoveLine}
            />
          </>
        )}
      </div>
    </div>
  );
};
