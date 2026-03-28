type CreateWeightTrackerActionsResultParams = {
  handleDeleteRecord: (date: string) => void;
  handleSaveWeight: () => void;
  reloadWeightData: () => void;
};

export const createWeightTrackerActionsResult = ({
  handleDeleteRecord,
  handleSaveWeight,
  reloadWeightData,
}: CreateWeightTrackerActionsResultParams) => {
  return {
    handleDeleteRecord,
    handleSaveWeight,
    reloadWeightData,
  };
};
