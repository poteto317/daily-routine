export type MoodType = "great" | "good" | "normal" | "tired" | "stressed";

export const MOOD_OPTIONS: {
  value: MoodType;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { value: "great", label: "絶好調", emoji: "😄", color: "bg-green-500" },
  { value: "good", label: "良い", emoji: "😊", color: "bg-blue-500" },
  { value: "normal", label: "普通", emoji: "😐", color: "bg-gray-500" },
  { value: "tired", label: "疲れた", emoji: "😮‍💨", color: "bg-yellow-500" },
  { value: "stressed", label: "ストレス", emoji: "😰", color: "bg-red-500" },
];

export interface WorkTemplate {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
}

export interface WorkSession {
  id: string;
  workTemplateId: string;
  workName: string;
  mood: MoodType;
  startTime: string;
  endTime?: string;
  duration?: number;
  notes?: string;
  createdAt: string;
}

export interface WorkSessionHistory {
  [date: string]: WorkSession[];
}
