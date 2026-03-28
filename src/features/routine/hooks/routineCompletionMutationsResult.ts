type RoutineCompletionMutationsResultArgs = {
  toggleComplete: (id: string) => void;
  reorderRoutines: (
    reorderedRoutines: import("@/types/routine").Routine[],
  ) => void;
};

export const createRoutineCompletionMutationsResult = ({
  toggleComplete,
  reorderRoutines,
}: RoutineCompletionMutationsResultArgs) => {
  return {
    toggleComplete,
    reorderRoutines,
  };
};
