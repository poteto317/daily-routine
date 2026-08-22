import type { Routine } from "@/types/routine";

export const buildUpdatedRoutine = (
  routine: Routine,
  updates: Partial<Routine>,
  now: string,
): Routine => ({ ...routine, ...updates, updatedAt: now });
