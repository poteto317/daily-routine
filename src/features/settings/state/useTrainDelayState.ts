import { useState } from "react";
import { getSettings } from "@/features/settings/storage";
import { AVAILABLE_LINES } from "./constants";
import { createTrainDelayStateResult } from "./trainDelayStateResult";
import { createTrainDelayInitialState } from "./trainDelayStateActions";
import { useTrainDelayLineActions } from "./useTrainDelayLineActions";

export const useTrainDelayState = () => {
  const initialState = createTrainDelayInitialState(getSettings());

  const [trainDelayEnabled, setTrainDelayEnabled] = useState<boolean>(
    initialState.trainDelayEnabled,
  );
  const [selectedLineInput, setSelectedLineInput] = useState<string>("");
  const [monitoredLines, setMonitoredLines] = useState(
    initialState.monitoredLines,
  );
  const { handleAddLine, handleRemoveLine } = useTrainDelayLineActions({
    selectedLineInput,
    monitoredLines,
    setMonitoredLines,
    setSelectedLineInput,
  });

  return createTrainDelayStateResult({
    trainDelayEnabled,
    setTrainDelayEnabled,
    selectedLineInput,
    setSelectedLineInput,
    monitoredLines,
    handleAddLine,
    handleRemoveLine,
    availableLines: AVAILABLE_LINES,
  });
};
