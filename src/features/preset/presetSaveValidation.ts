export const isPresetSourceSaveDisabled = (
  name: string,
  sourceRoutineCount: number,
): boolean => !name.trim() || sourceRoutineCount === 0;
