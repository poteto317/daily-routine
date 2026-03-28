import type { Dispatch, SetStateAction } from "react";
import type { Routine } from "@/types/routine";

export type SetRoutines = Dispatch<SetStateAction<Routine[]>>;
export type SaveAndSyncAction = (updated: Routine[]) => void;
export type RoutineMutation = (previous: Routine[]) => Routine[];
export type RunAndSync = (mutate: RoutineMutation) => void;

export const applyRoutineMutationAndSync = (
  previous: Routine[],
  mutate: RoutineMutation,
  saveAndSync: SaveAndSyncAction,
): Routine[] => {
  const updated = mutate(previous);
  saveAndSync(updated);
  return updated;
};

export const createRoutineMutationRunner = (
  setRoutines: SetRoutines,
  saveAndSync: SaveAndSyncAction,
): RunAndSync => {
  return (mutate) => {
    setRoutines((previous) =>
      applyRoutineMutationAndSync(previous, mutate, saveAndSync),
    );
  };
};
