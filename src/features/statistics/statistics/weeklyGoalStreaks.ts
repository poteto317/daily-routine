export const calculateStreaks = (
  achievedByWeek: boolean[],
  lastWeekIsCurrent: boolean,
): { currentStreak: number; longestStreak: number } => {
  let longestStreak = 0;
  let running = 0;

  achievedByWeek.forEach((achieved) => {
    running = achieved ? running + 1 : 0;
    longestStreak = Math.max(longestStreak, running);
  });

  const currentSlice =
    lastWeekIsCurrent && achievedByWeek.at(-1) === false
      ? achievedByWeek.slice(0, -1)
      : achievedByWeek;
  let currentStreak = 0;

  for (let index = currentSlice.length - 1; index >= 0; index -= 1) {
    if (!currentSlice[index]) break;
    currentStreak += 1;
  }

  return { currentStreak, longestStreak };
};
