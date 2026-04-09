import type { MonitoredLine } from "../state/constants";
import { getMonitoredLinesCountLabel } from "../helpers/trainDelay";
import texts from "../locales/ja.json";

type Props = {
  monitoredLines: MonitoredLine[];
  handleRemoveLine: (lineId: string) => void;
};

export const MonitoredLinesList = ({
  monitoredLines,
  handleRemoveLine,
}: Props) => {
  if (monitoredLines.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        {texts.monitoredLines.emptyMessage}
      </p>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {getMonitoredLinesCountLabel(monitoredLines.length)}
      </label>
      <div className="space-y-2">
        {monitoredLines.map((line) => (
          <div
            key={line.lineId}
            className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
          >
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {line.lineName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {line.company}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleRemoveLine(line.lineId)}
              className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 text-sm font-medium"
            >
              {texts.monitoredLines.removeLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
