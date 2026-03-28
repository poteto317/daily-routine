import { useCallback } from "react";
import { AVAILABLE_LINES } from "./constants";
import texts from "../locales/ja.json";
import {
  addTrainDelayLine,
  removeTrainDelayLine,
} from "./trainDelayStateActions";
import { createTrainDelayLineActionsResult } from "./trainDelayLineActionsResult";
import type { MonitoredLine } from "./constants";

type UseTrainDelayLineActionsArgs = {
  selectedLineInput: string;
  monitoredLines: MonitoredLine[];
  setMonitoredLines: (lines: MonitoredLine[]) => void;
  setSelectedLineInput: (value: string) => void;
};

export const useTrainDelayLineActions = ({
  selectedLineInput,
  monitoredLines,
  setMonitoredLines,
  setSelectedLineInput,
}: UseTrainDelayLineActionsArgs) => {
  const handleAddLine = useCallback(() => {
    const nextState = addTrainDelayLine({
      selectedLineInput,
      monitoredLines,
      availableLines: AVAILABLE_LINES,
      duplicateMessage: texts.trainDelay.alertDuplicateLine,
    });

    if (!nextState.added) return;

    setMonitoredLines(nextState.nextMonitoredLines);
    setSelectedLineInput(nextState.nextSelectedLineInput);
  }, [
    monitoredLines,
    selectedLineInput,
    setMonitoredLines,
    setSelectedLineInput,
  ]);

  const handleRemoveLine = useCallback(
    (lineId: string) => {
      setMonitoredLines(removeTrainDelayLine(monitoredLines, lineId));
    },
    [monitoredLines, setMonitoredLines],
  );

  return createTrainDelayLineActionsResult({
    handleAddLine,
    handleRemoveLine,
  });
};
