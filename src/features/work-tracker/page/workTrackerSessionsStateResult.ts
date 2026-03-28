import type { Dispatch, SetStateAction } from "react";
import type { WorkSession } from "@/types/routine";

type WorkTrackerSessionsStateResultInput = {
  sessions: WorkSession[];
  setSessions: Dispatch<SetStateAction<WorkSession[]>>;
};

export const createWorkTrackerSessionsStateResult = ({
  sessions,
  setSessions,
}: WorkTrackerSessionsStateResultInput) => ({
  sessions,
  setSessions,
});
