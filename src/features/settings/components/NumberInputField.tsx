import { LabeledField } from "@/components";
import { isInvalidNumberInput } from "./settingsInputValidation";

type NumberInputFieldProps = {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  errorText: string;
  hint: string;
};

export const NumberInputField = ({
  label,
  description,
  value,
  onChange,
  min,
  max,
  errorText,
  hint,
}: NumberInputFieldProps) => {
  const invalid = isInvalidNumberInput(value, min, max);

  return (
    <LabeledField
      label={label}
      labelClassName="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2"
    >
      {(inputId) => (
        <>
          <p className="text-xs text-gray-500 dark:text-gray-600 mb-3">
            {description}
          </p>
          <input
            id={inputId}
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 dark:bg-white dark:text-gray-900 ${
              invalid
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-400 focus:ring-blue-500"
            }`}
          />
          {invalid && (
            <p className="text-xs text-red-600 dark:text-red-700 mt-1">
              {errorText}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">
            {hint}
          </p>
        </>
      )}
    </LabeledField>
  );
};
