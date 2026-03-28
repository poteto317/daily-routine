import type { RoutineCategory } from "./categories";

export interface Routine {
  id: string;
  groupId?: string;
  title: string;
  startTime: string;
  duration: number;
  category: RoutineCategory;
  daysOfWeek: number[];
  description?: string;
  isCompleted: boolean;
  notificationMinutes?: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineTemplate {
  title: string;
  startTime: string;
  duration: number;
  category: RoutineCategory;
  description?: string;
  notificationMinutes?: number;
}

export interface RoutinePreset {
  id: string;
  name: string;
  description?: string;
  routineTemplates: RoutineTemplate[];
  createdAt: string;
  updatedAt: string;
}
