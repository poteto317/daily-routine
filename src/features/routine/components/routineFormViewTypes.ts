import type { Routine, RoutineCategory } from "@/types/routine";

export type RoutineConflictInfo = {
  hasConflict: boolean;
  conflictingRoutines: Array<{ routine: Routine; commonDays: number[] }>;
};

export type RoutineFormCoreProps = {
  routine?: Routine;
  category: RoutineCategory;
  setCategory: (category: RoutineCategory) => void;
  daysOfWeek: number[];
  toggleDay: (day: number) => void;
  title: string;
  setTitle: (value: string) => void;
};
