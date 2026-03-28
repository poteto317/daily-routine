const notificationSchedules = new Map();
let checkInterval = null;

export const getSchedules = () => notificationSchedules;

export const clearSchedules = () => {
  notificationSchedules.clear();
};

export const setSchedules = (schedules) => {
  notificationSchedules.clear();
  schedules.forEach((schedule) => {
    notificationSchedules.set(schedule.id, schedule);
  });
};

export const getCheckInterval = () => checkInterval;

export const setCheckInterval = (interval) => {
  checkInterval = interval;
};
