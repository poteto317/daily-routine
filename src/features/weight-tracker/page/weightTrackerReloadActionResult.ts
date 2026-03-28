type WeightTrackerReloadActionResultArgs = {
  reloadWeightData: () => void;
};

export const createWeightTrackerReloadActionResult = ({
  reloadWeightData,
}: WeightTrackerReloadActionResultArgs) => {
  return { reloadWeightData };
};
