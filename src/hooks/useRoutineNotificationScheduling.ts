"use client";

import { useCallback } from "react";
import { scheduleRoutineNotificationsIfPermitted } from "./pwaInstallerActions";

export const useRoutineNotificationScheduling = () => {
  return useCallback(async () => {
    await scheduleRoutineNotificationsIfPermitted();
  }, []);
};
