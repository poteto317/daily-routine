import { MoodType } from "@/types/routine";
import {
  addWorkSession,
  getOrCreateWorkTemplate,
  updateWorkTemplateLastUsed,
} from "@/lib/storage";

type Params = {
  workName: string;
  selectedMood: MoodType;
  elapsedTime: number;
  notes: string;
  startTime: Date | null;
};

export const persistWorkSession = ({
  workName,
  selectedMood,
  elapsedTime,
  notes,
  startTime,
}: Params) => {
  const template = getOrCreateWorkTemplate(workName.trim());
  updateWorkTemplateLastUsed(template.id);

  const now = new Date();
  addWorkSession({
    id: `ws-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
    workTemplateId: template.id,
    workName: template.name,
    mood: selectedMood,
    startTime: startTime?.toISOString() || now.toISOString(),
    endTime: now.toISOString(),
    duration: elapsedTime,
    notes: notes.trim() || undefined,
    createdAt: now.toISOString(),
  });
};
