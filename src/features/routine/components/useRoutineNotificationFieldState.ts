import { useState } from "react";

type UseRoutineNotificationFieldStateParams = {
  initialNotificationMinutes: string;
};

export const useRoutineNotificationFieldState = ({
  initialNotificationMinutes,
}: UseRoutineNotificationFieldStateParams) => {
  const [notificationMinutes, setNotificationMinutes] = useState(
    initialNotificationMinutes,
  );

  return {
    notificationMinutes,
    setNotificationMinutes,
  };
};
