export interface NotificationSchedule {
  id: string;
  title: string;
  body: string;
  time: string;
  minutesAfter: number;
  dayOfWeek?: number;
  isHoliday?: boolean;
}
