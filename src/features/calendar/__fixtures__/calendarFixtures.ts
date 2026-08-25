import type { MonthlyHistory, PomodoroHistory } from "@/types/routine";

export const sampleMonthlyHistory: MonthlyHistory = {
  "2026-05-22": {
    date: "2026-05-22",
    completedRoutineIds: ["r-1", "r-2"],
    routineSnapshots: [
      {
        id: "r-1",
        title: "朝のストレッチ",
        category: "health",
        startTime: "07:00",
      },
      { id: "r-2", title: "英語学習", category: "study", startTime: "06:30" },
    ],
  },
  "2026-05-23": {
    date: "2026-05-23",
    completedRoutineIds: ["r-1"],
    routineSnapshots: [
      {
        id: "r-1",
        title: "朝のストレッチ",
        category: "health",
        startTime: "07:00",
      },
    ],
  },
};

export const sampleCalendarPomodoroHistory: PomodoroHistory = {
  "2026-05-22": { date: "2026-05-22", completedPomodoros: 3 },
  "2026-05-23": { date: "2026-05-23", completedPomodoros: 1 },
};
