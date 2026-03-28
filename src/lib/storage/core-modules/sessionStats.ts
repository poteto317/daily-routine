export const calculateSessionStats = (
  durations: number[],
): {
  count: number;
  averageDuration: number;
  bestDuration: number;
  latestDuration: number;
  trend: "improving" | "stable" | "declining" | "first";
} => {
  const validDurations = durations.filter((duration) => duration > 0);

  if (validDurations.length === 0) {
    return {
      count: durations.length,
      averageDuration: 0,
      bestDuration: 0,
      latestDuration: 0,
      trend: "first",
    };
  }

  const averageDuration =
    validDurations.reduce((sum, duration) => sum + duration, 0) /
    validDurations.length;
  const bestDuration = Math.min(...validDurations);
  const latestDuration = validDurations[0] || 0;

  let trend: "improving" | "stable" | "declining" | "first" = "first";

  if (validDurations.length >= 2) {
    const recentDurations = validDurations.slice(
      0,
      Math.min(3, validDurations.length),
    );
    const recentAverage =
      recentDurations.reduce((sum, duration) => sum + duration, 0) /
      recentDurations.length;

    if (recentAverage < bestDuration * 1.1) {
      trend = "improving";
    } else if (recentAverage > averageDuration * 1.1) {
      trend = "declining";
    } else {
      trend = "stable";
    }
  }

  return {
    count: durations.length,
    averageDuration,
    bestDuration,
    latestDuration,
    trend,
  };
};
