type LineOption = { id: string; name: string; company: string };

export const getMonitoredLinesCountLabel = (count: number): string => {
  return `監視中の路線 (${count})`;
};

export const getTrainDelayToggleClassName = (enabled: boolean): string => {
  return `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
    enabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
  }`;
};

export const getTrainDelayThumbClassName = (enabled: boolean): string => {
  return `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
    enabled ? "translate-x-6" : "translate-x-1"
  }`;
};

export const isAddLineButtonDisabled = (selectedLineInput: string): boolean => {
  return !selectedLineInput;
};

export const getLineOptionLabel = (line: LineOption): string => {
  return `${line.company} - ${line.name}`;
};
