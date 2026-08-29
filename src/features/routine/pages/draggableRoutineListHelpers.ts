import { arrayMove } from "@dnd-kit/sortable";
import { type Routine } from "@/types/routine";
import { assignSequentialStartTimes } from "../routineReorderScheduleModel";

export const reorderRoutinesWithSequentialTimes = (
  routines: Routine[],
  activeId: string,
  overId: string,
): Routine[] | null => {
  const oldIndex = routines.findIndex((routine) => routine.id === activeId);
  const newIndex = routines.findIndex((routine) => routine.id === overId);

  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return null;

  const reordered = arrayMove(routines, oldIndex, newIndex);
  const range = {
    start: Math.min(oldIndex, newIndex),
    end: Math.max(oldIndex, newIndex),
  };

  return assignSequentialStartTimes(
    reordered,
    range,
    routines[range.start].startTime,
  );
};
