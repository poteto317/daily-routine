import {
  clearSchedules,
  getCheckInterval,
  getSchedules,
  setCheckInterval,
  setSchedules,
} from "./notificationState";
import { checkAndSendNotifications } from "./checkAndSendNotifications";
import { logToClient } from "./logToClient";

const stopNotificationCheck = () => {
  const interval = getCheckInterval();
  if (!interval) {
    return;
  }

  clearInterval(interval);
  setCheckInterval(null);
  logToClient("[Custom SW] Notification check stopped");
};

const startNotificationCheck = () => {
  const interval = getCheckInterval();
  if (interval) {
    clearInterval(interval);
  }

  logToClient("[Custom SW] Starting notification check");

  const nextInterval = setInterval(() => {
    void checkAndSendNotifications(getSchedules());
  }, 60000);

  setCheckInterval(nextInterval);
  void checkAndSendNotifications(getSchedules());
};

const postPortResponse = (event, payload) => {
  if (event.ports && event.ports[0]) {
    event.ports[0].postMessage(payload);
  }
};

export const handleSchedulerMessage = (event) => {
  if (!event.data) {
    return;
  }

  if (event.data.type === "TEST") {
    return;
  }

  if (event.data.type === "SCHEDULE_NOTIFICATIONS") {
    const { schedules } = event.data;
    setSchedules(schedules);
    logToClient(`[Custom SW] Schedules updated: ${getSchedules().size}`);
    startNotificationCheck();
    postPortResponse(event, { success: true, count: schedules.length });
    return;
  }

  if (event.data.type === "CLEAR_SCHEDULES") {
    clearSchedules();
    stopNotificationCheck();
    postPortResponse(event, { success: true });
  }
};
