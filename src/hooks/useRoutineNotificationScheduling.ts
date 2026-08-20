"use client";

import { useCallback } from "react";
import { scheduleRoutineNotificationsIfPermitted } from "./routineNotificationScheduling";

export const useRoutineNotificationScheduling = () => {
  return useCallback(async () => {
    await scheduleRoutineNotificationsIfPermitted();
  }, []);
};
