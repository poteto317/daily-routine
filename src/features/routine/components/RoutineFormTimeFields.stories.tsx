import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { RoutineFormTimeFields } from "./RoutineFormTimeFields";

const meta = {
  title: "Features/Routine/RoutineFormTimeFields",
  component: RoutineFormTimeFields,
  parameters: {
    layout: "padded",
  },
  args: {
    setStartTime: fn(),
    setDuration: fn(),
    defaultDurationMinutes: 30,
  },
} satisfies Meta<typeof RoutineFormTimeFields>;

export default meta;
type Story = StoryObj<typeof meta>;

const noConflict = { hasConflict: false, conflictingRoutines: [] };

export const Default: Story = {
  args: {
    startTime: "07:00",
    duration: "30",
    conflictInfo: noConflict,
  },
};

export const EmptyValues: Story = {
  args: {
    startTime: "",
    duration: "",
    conflictInfo: noConflict,
  },
};

export const WithConflict: Story = {
  args: {
    startTime: "07:00",
    duration: "60",
    conflictInfo: {
      hasConflict: true,
      conflictingRoutines: [
        {
          routine: {
            id: "r-existing",
            title: "朝のストレッチ",
            startTime: "07:15",
            duration: 15,
            category: "health",
            daysOfWeek: [1, 2, 3],
            isCompleted: false,
            sortOrder: 0,
            createdAt: "2026-01-01T00:00:00+09:00",
            updatedAt: "2026-01-01T00:00:00+09:00",
          },
          commonDays: [1, 2, 3],
        },
      ],
    },
  },
};
