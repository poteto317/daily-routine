import type { MonitoredLine } from "./constants";

type TrainDelayStateResultArgs = {
  availableLines: typeof import("./constants").AVAILABLE_LINES;
  handleAddLine: () => void;
  handleRemoveLine: (lineId: string) => void;
  monitoredLines: MonitoredLine[];
  selectedLineInput: string;
  setSelectedLineInput: React.Dispatch<React.SetStateAction<string>>;
  setTrainDelayEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  trainDelayEnabled: boolean;
};

export const createTrainDelayStateResult = ({
  availableLines,
  handleAddLine,
  handleRemoveLine,
  monitoredLines,
  selectedLineInput,
  setSelectedLineInput,
  setTrainDelayEnabled,
  trainDelayEnabled,
}: TrainDelayStateResultArgs) => {
  return {
    trainDelayEnabled,
    setTrainDelayEnabled,
    selectedLineInput,
    setSelectedLineInput,
    monitoredLines,
    handleAddLine,
    handleRemoveLine,
    availableLines,
  };
};
