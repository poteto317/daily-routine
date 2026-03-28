type TrainDelayLineActionsResultArgs = {
  handleAddLine: () => void;
  handleRemoveLine: (lineId: string) => void;
};

export const createTrainDelayLineActionsResult = ({
  handleAddLine,
  handleRemoveLine,
}: TrainDelayLineActionsResultArgs) => {
  return {
    handleAddLine,
    handleRemoveLine,
  };
};
