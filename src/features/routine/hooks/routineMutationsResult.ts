import type { RoutineMutationActions } from "./routineHookContract";

type RoutineMutationsResultArgs = {
  crudMutations: Omit<
    RoutineMutationActions,
    "toggleComplete" | "reorderRoutines"
  >;
  toggleComplete: RoutineMutationActions["toggleComplete"];
  reorderRoutines: RoutineMutationActions["reorderRoutines"];
};

export const createRoutineMutationsResult = ({
  crudMutations,
  toggleComplete,
  reorderRoutines,
}: RoutineMutationsResultArgs): RoutineMutationActions => {
  return {
    ...crudMutations,
    toggleComplete,
    reorderRoutines,
  };
};
