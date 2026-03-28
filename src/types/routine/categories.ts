export type RoutineCategory =
  | "work"
  | "health"
  | "hobby"
  | "study"
  | "life"
  | "other";

export const HOLIDAY_DAY_VALUE = 7;

export const ROUTINE_CATEGORIES: {
  value: RoutineCategory;
  label: string;
  emoji: string;
  color: string;
}[] = [
  {
    value: "hobby",
    label: "趣味",
    emoji: "🎨",
    color:
      "bg-purple-100 dark:bg-purple-200 text-purple-800 dark:text-purple-900",
  },
  {
    value: "life",
    label: "生活",
    emoji: "🏠",
    color: "bg-pink-100 dark:bg-pink-200 text-pink-800 dark:text-pink-900",
  },
  {
    value: "health",
    label: "健康",
    emoji: "💪",
    color: "bg-green-100 dark:bg-green-200 text-green-800 dark:text-green-900",
  },
  {
    value: "study",
    label: "勉強",
    emoji: "📚",
    color:
      "bg-yellow-100 dark:bg-yellow-200 text-yellow-800 dark:text-yellow-900",
  },
  {
    value: "work",
    label: "仕事",
    emoji: "💼",
    color: "bg-blue-100 dark:bg-blue-200 text-blue-800 dark:text-blue-900",
  },
  {
    value: "other",
    label: "その他",
    emoji: "📌",
    color: "bg-gray-100 dark:bg-gray-200 text-gray-800 dark:text-gray-900",
  },
];
