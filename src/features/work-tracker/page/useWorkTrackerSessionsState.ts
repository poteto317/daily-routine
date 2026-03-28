import { useState } from "react";
import { getTodayWorkSessions } from "@/lib/storage";
import type { WorkSession } from "@/types/routine";
import { createWorkTrackerSessionsStateResult } from "./workTrackerSessionsStateResult";

export const useWorkTrackerSessionsState = () => {
  const [sessions, setSessions] = useState<WorkSession[]>(() =>
    getTodayWorkSessions(),
  );

  return createWorkTrackerSessionsStateResult({
    sessions,
    setSessions,
  });
};
