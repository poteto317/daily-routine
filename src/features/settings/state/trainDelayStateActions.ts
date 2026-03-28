import type { AppSettings } from "@/types/routine";
import type { MonitoredLine } from "./constants";
import {
  createMonitoredLine,
  hasMonitoredLine,
  removeMonitoredLine,
  resolveSelectedLine,
} from "./trainDelayStateHelpers";

type LineOption = { id: string; name: string; company: string };

type TrainDelayInitialState = {
  trainDelayEnabled: boolean;
  monitoredLines: MonitoredLine[];
};

type AddTrainDelayLineArgs = {
  selectedLineInput: string;
  monitoredLines: MonitoredLine[];
  availableLines: LineOption[];
  duplicateMessage: string;
  alertFn?: (message?: string) => void;
};

type AddTrainDelayLineResult = {
  added: boolean;
  nextMonitoredLines: MonitoredLine[];
  nextSelectedLineInput: string;
};

export const createTrainDelayInitialState = (
  settings: AppSettings,
): TrainDelayInitialState => {
  return {
    trainDelayEnabled: settings.trainDelay?.enabled || false,
    monitoredLines: settings.trainDelay?.monitoredLines || [],
  };
};

export const addTrainDelayLine = ({
  selectedLineInput,
  monitoredLines,
  availableLines,
  duplicateMessage,
  alertFn = window.alert,
}: AddTrainDelayLineArgs): AddTrainDelayLineResult => {
  if (!selectedLineInput) {
    return {
      added: false,
      nextMonitoredLines: monitoredLines,
      nextSelectedLineInput: selectedLineInput,
    };
  }

  const line = resolveSelectedLine(selectedLineInput, availableLines);
  if (!line) {
    return {
      added: false,
      nextMonitoredLines: monitoredLines,
      nextSelectedLineInput: selectedLineInput,
    };
  }

  if (hasMonitoredLine(monitoredLines, line.id)) {
    alertFn(duplicateMessage);
    return {
      added: false,
      nextMonitoredLines: monitoredLines,
      nextSelectedLineInput: selectedLineInput,
    };
  }

  return {
    added: true,
    nextMonitoredLines: [...monitoredLines, createMonitoredLine(line)],
    nextSelectedLineInput: "",
  };
};

export const removeTrainDelayLine = (
  monitoredLines: MonitoredLine[],
  lineId: string,
): MonitoredLine[] => {
  return removeMonitoredLine(monitoredLines, lineId);
};

export type { AddTrainDelayLineResult, TrainDelayInitialState };
