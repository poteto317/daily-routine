import { NumberInputField } from "./NumberInputField";
import {
  DEFAULT_DURATION_FIELD,
  DEFAULT_NOTIFICATION_FIELD,
  POMODORO_FIELDS,
} from "../helpers/defaultAndPomodoro";
import texts from "../locales/ja.json";

type Props = {
  durationInput: string;
  setDurationInput: (value: string) => void;
  notificationInput: string;
  setNotificationInput: (value: string) => void;
  pomodoroFocusInput: string;
  setPomodoroFocusInput: (value: string) => void;
  pomodoroBreakInput: string;
  setPomodoroBreakInput: (value: string) => void;
};

export const DefaultAndPomodoroSection = ({
  durationInput,
  setDurationInput,
  notificationInput,
  setNotificationInput,
  pomodoroFocusInput,
  setPomodoroFocusInput,
  pomodoroBreakInput,
  setPomodoroBreakInput,
}: Props) => {
  return (
    <>
      <NumberInputField
        value={durationInput}
        onChange={setDurationInput}
        {...DEFAULT_DURATION_FIELD}
      />
      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {DEFAULT_NOTIFICATION_FIELD.label}
          </label>
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
            {texts.defaultAndPomodoro.notificationBetaLabel}
          </span>
        </div>
        <NumberInputField
          value={notificationInput}
          onChange={setNotificationInput}
          {...DEFAULT_NOTIFICATION_FIELD}
        />
      </div>
      <div className="border-t dark:border-gray-600 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-black mb-4">
          {texts.defaultAndPomodoro.pomodoroSectionTitle}
        </h3>
        <div className="space-y-4">
          {POMODORO_FIELDS.map((field, index) => (
            <NumberInputField
              key={field.label}
              value={index === 0 ? pomodoroFocusInput : pomodoroBreakInput}
              onChange={
                index === 0 ? setPomodoroFocusInput : setPomodoroBreakInput
              }
              {...field}
            />
          ))}
        </div>
      </div>
    </>
  );
};
