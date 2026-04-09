import { arrayMove } from "@dnd-kit/sortable";
import type { Routine } from "@/types/routine";

export const reorderRoutinesWithOriginalTimes = (
  routines: Routine[],
  activeId: string,
  overId: string,
): Routine[] | null => {
  const oldIndex = routines.findIndex((routine) => routine.id === activeId);
  const newIndex = routines.findIndex((routine) => routine.id === overId);

  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return null;

  const reordered = arrayMove(routines, oldIndex, newIndex);

  return reordered.map((routine, index) => ({
    ...routine,
    startTime: routines[index].startTime,
  }));
};
