import { getRoutines } from "@/features/routine/storage";
import type { NotificationStatus } from "../state/constants";
import {
  getDebugMessageClassName,
  getNotificationButtonViewModel,
  getRoutineNotificationCounts,
} from "../helpers/notificationTest";
import texts from "../locales/ja.json";

type Props = {
  notificationStatus: NotificationStatus;
  debugMessage: string;
  swLogs: string[];
  clearLogs: () => void;
  handleTestNotification: () => Promise<void>;
};

export const NotificationTestSection = ({
  notificationStatus,
  debugMessage,
  swLogs,
  clearLogs,
  handleTestNotification,
}: Props) => {
  const buttonViewModel = getNotificationButtonViewModel(notificationStatus);
  const debugMessageClassName = getDebugMessageClassName(notificationStatus);
  const routineNotificationCounts = getRoutineNotificationCounts(getRoutines());

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {texts.notificationTest.label}
          </label>
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
            Beta
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {texts.notificationTest.description}
      </p>
      <button
        type="button"
        onClick={handleTestNotification}
        disabled={buttonViewModel.disabled}
        className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${buttonViewModel.className}`}
      >
        {buttonViewModel.label}
      </button>

      {debugMessage && (
        <div className={`mt-3 p-3 rounded-lg text-sm ${debugMessageClassName}`}>
          {debugMessage}
        </div>
      )}
      {notificationStatus === "error" && !debugMessage && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
          {texts.notificationTest.errorHint}
        </p>
      )}

      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {texts.notificationTest.routineCountLabel}:{" "}
          {routineNotificationCounts.totalRoutines}
          {texts.notificationTest.counterSuffix}
          <br />
          {texts.notificationTest.activeCountLabel}:{" "}
          {routineNotificationCounts.activeNotificationRoutines}
          {texts.notificationTest.counterSuffix}
        </p>
      </div>

      {swLogs.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {texts.notificationTest.swLogTitle}
            </p>
            <button
              type="button"
              onClick={clearLogs}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              {texts.notificationTest.clearLogLabel}
            </button>
          </div>
          <div className="p-3 bg-gray-900 dark:bg-gray-950 rounded-lg max-h-60 overflow-y-auto">
            {swLogs.map((log, i) => (
              <p key={i} className="text-xs text-green-400 font-mono mb-1">
                {log}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
