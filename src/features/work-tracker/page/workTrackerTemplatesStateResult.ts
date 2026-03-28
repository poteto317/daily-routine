import type { Dispatch, SetStateAction } from "react";
import type { WorkTemplate } from "@/types/routine";

type WorkTrackerTemplatesStateResultInput = {
  templates: WorkTemplate[];
  setTemplates: Dispatch<SetStateAction<WorkTemplate[]>>;
};

export const createWorkTrackerTemplatesStateResult = ({
  templates,
  setTemplates,
}: WorkTrackerTemplatesStateResultInput) => ({
  templates,
  setTemplates,
});
