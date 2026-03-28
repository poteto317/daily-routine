import type { RoutineMutationActions } from "./routineHookContract";

export const createRoutineMutationsResult = (
  crudMutations: Omit<
    RoutineMutationActions,
    "toggleComplete" | "reorderRoutines"
  >,
  completionMutations: Pick<
    RoutineMutationActions,
    "toggleComplete" | "reorderRoutines"
  >,
): RoutineMutationActions => {
  return {
    ...crudMutations,
    ...completionMutations,
  };
};
