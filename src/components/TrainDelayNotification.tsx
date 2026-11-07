"use client";

import { type TrainDelayInfo } from "@/types/routine";
import texts from "./locales/ja.json";
import {
  formatDelayLastUpdatedTime,
  getDelayMinutesText,
  getDelayReasonText,
  getDelaySeverityColorClass,
  getDelaySeverityIcon,
} from "./trainDelayHelpers";

interface TrainDelayNotificationProps {
  delays: TrainDelayInfo[];
}

export const TrainDelayNotification = ({
  delays,
}: TrainDelayNotificationProps) => {
  if (!delays || delays.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-4">
      {delays.map((delay) => (
        <div
          key={delay.lineId}
          className={`p-4 rounded-xl border-2 shadow-md transition-all hover:shadow-lg ${getDelaySeverityColorClass(delay.delayMinutes)}`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">
              {getDelaySeverityIcon(delay.delayMinutes)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="font-bold text-gray-900 dark:text-gray-900 text-base">
                  🚃 {delay.lineName}
                </h3>
                <span className="text-xs text-gray-600 dark:text-gray-700 whitespace-nowrap">
                  {formatDelayLastUpdatedTime(delay.lastUpdated)}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-800 mb-1">
                <span className="font-semibold text-red-700 dark:text-red-800">
                  {getDelayMinutesText(delay.delayMinutes)}
                </span>
                {delay.section && (
                  <span className="ml-2 text-gray-600 dark:text-gray-700">
                    ({delay.section})
                  </span>
                )}
              </p>
              {delay.reason && (
                <p className="text-xs text-gray-600 dark:text-gray-700 mt-1">
                  {getDelayReasonText(delay.reason)}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">
                {delay.company}
              </p>
            </div>
          </div>
        </div>
      ))}
      <p className="text-xs text-gray-500 dark:text-gray-600 text-center mt-2">
        {texts.trainDelay.mockHint}
      </p>
    </div>
  );
};
