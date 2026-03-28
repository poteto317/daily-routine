import { useState } from "react";
import { createInitialWorkTrackerPageState } from "./viewStateActions";
import type { WorkSession, WorkTemplate } from "@/types/routine";

type UseWorkTrackerInitialStateParams = {
  sessions: WorkSession[];
  templates: WorkTemplate[];
};

export const useWorkTrackerInitialState = ({
  sessions,
  templates,
}: UseWorkTrackerInitialStateParams) => {
  const [initialState] = useState(() =>
    createInitialWorkTrackerPageState({
      sessions,
      templates,
    }),
  );

  return initialState;
};
