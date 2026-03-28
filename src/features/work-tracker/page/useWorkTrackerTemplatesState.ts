import { useState } from "react";
import { getWorkTemplates } from "@/lib/storage";
import type { WorkTemplate } from "@/types/routine";
import { createWorkTrackerTemplatesStateResult } from "./workTrackerTemplatesStateResult";

export const useWorkTrackerTemplatesState = () => {
  const [templates, setTemplates] = useState<WorkTemplate[]>(() =>
    getWorkTemplates(),
  );

  return createWorkTrackerTemplatesStateResult({
    templates,
    setTemplates,
  });
};
