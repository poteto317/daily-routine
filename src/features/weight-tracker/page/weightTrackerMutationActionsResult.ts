type WeightTrackerMutationActionsResultArgs = {
  handleDeleteRecord: (date: string) => void;
  handleSaveWeight: () => void;
};

export const createWeightTrackerMutationActionsResult = ({
  handleDeleteRecord,
  handleSaveWeight,
}: WeightTrackerMutationActionsResultArgs) => {
  return {
    handleDeleteRecord,
    handleSaveWeight,
  };
};
