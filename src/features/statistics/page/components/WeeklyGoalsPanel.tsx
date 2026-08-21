import { STATISTICS_WEEKLY_GOALS_TEXT } from "../../helpers";
import type { WeeklyGoalProgress } from "../../statistics/types";

type WeeklyGoalsPanelProps = {
  goals: WeeklyGoalProgress[];
};

const formatTemplate = (
  template: string,
  values: Record<string, string | number>,
): string =>
  Object.entries(values).reduce(
    (result, [key, value]) =>
      result.replace(`{${key}}`, String(value)),
    template,
  );

export const WeeklyGoalsPanel = ({ goals }: WeeklyGoalsPanelProps) => (
  <section
    aria-labelledby="weekly-goals-title"
    className="mb-6 rounded-lg border border-blue-100 bg-white p-4 dark:border-slate-300 dark:bg-slate-100"
  >
    <h3
      id="weekly-goals-title"
      className="mb-4 text-lg font-semibold text-gray-900"
    >
      {STATISTICS_WEEKLY_GOALS_TEXT.title}
    </h3>

    {goals.length === 0 ? (
      <p className="text-sm text-gray-600">
        {STATISTICS_WEEKLY_GOALS_TEXT.empty}
      </p>
    ) : (
      <div className="space-y-4">
        {goals.map((goal) => {
          const progressPercentage = Math.min(
            100,
            (goal.completedCount / goal.targetPerWeek) * 100,
          );

          return (
            <article
              key={goal.goalId}
              className={`rounded-lg border p-4 ${
                goal.isAchieved
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-medium text-gray-900">{goal.title}</h4>
                <span
                  className={`text-sm font-semibold ${
                    goal.isAchieved ? "text-green-700" : "text-blue-700"
                  }`}
                >
                  {goal.isAchieved
                    ? STATISTICS_WEEKLY_GOALS_TEXT.completed
                    : formatTemplate(
                        STATISTICS_WEEKLY_GOALS_TEXT.remainingTemplate,
                        { count: goal.remainingCount },
                      )}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm text-gray-700">
                <span>
                  {formatTemplate(
                    STATISTICS_WEEKLY_GOALS_TEXT.progressTemplate,
                    {
                      completed: goal.completedCount,
                      target: goal.targetPerWeek,
                    },
                  )}
                </span>
                <span className="flex gap-3">
                  <span>
                    {formatTemplate(
                      STATISTICS_WEEKLY_GOALS_TEXT.currentStreakTemplate,
                      { count: goal.currentStreak },
                    )}
                  </span>
                  <span>
                    {formatTemplate(
                      STATISTICS_WEEKLY_GOALS_TEXT.longestStreakTemplate,
                      { count: goal.longestStreak },
                    )}
                  </span>
                </span>
              </div>

              <div
                role="progressbar"
                aria-label={formatTemplate(
                  STATISTICS_WEEKLY_GOALS_TEXT.progressAriaTemplate,
                  { title: goal.title },
                )}
                aria-valuemin={0}
                aria-valuenow={goal.completedCount}
                aria-valuemax={goal.targetPerWeek}
                className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200"
              >
                <div
                  className={`h-full rounded-full ${
                    goal.isAchieved ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </article>
          );
        })}
      </div>
    )}
  </section>
);
