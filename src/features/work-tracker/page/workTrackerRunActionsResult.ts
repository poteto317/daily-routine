type WorkTrackerRunActionsResultArgs = {
  startTimer: () => void;
  stopTimer: () => void;
};

export const createWorkTrackerRunActionsResult = ({
  startTimer,
  stopTimer,
}: WorkTrackerRunActionsResultArgs) => {
  return {
    startTimer,
    stopTimer,
  };
};
