import type { Routine } from "@/types/routine";
import type {
  RoutineBatchCreateInput,
  RoutineCreateInput,
} from "./routineStateModel";

export type RoutineMutationActions = {
  addRoutine: (routine: RoutineCreateInput) => void;
  addRoutines: (routines: RoutineBatchCreateInput[]) => void;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  deleteRoutineGroup: (groupId: string) => void;
  replaceRoutinesForDays: (
    targetDays: number[],
    newRoutines: RoutineBatchCreateInput[],
  ) => void;
  toggleComplete: (id: string) => void;
  reorderRoutines: (reorderedRoutines: Routine[]) => void;
};

export type RoutineQueryActions = {
  getTodayRoutines: () => Routine[];
  getRoutinesByDayOfWeek: (dayOfWeek: number) => Routine[];
  getHolidayRoutines: () => Routine[];
  getIsTodayHoliday: () => boolean;
};

export type RoutineScheduleActions = {
  updateServiceWorkerSchedules: (
    routinesToSchedule?: Routine[],
  ) => Promise<unknown>;
};

export type UseRoutinesResult = {
  routines: Routine[];
  isLoaded: boolean;
} & RoutineMutationActions &
  RoutineQueryActions &
  RoutineScheduleActions;
