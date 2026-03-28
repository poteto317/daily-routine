type NotificationLogStateResultInput = {
  swLogs: string[];
  startLogCapture: () => void;
  clearLogs: () => void;
};

export const createNotificationLogStateResult = ({
  swLogs,
  startLogCapture,
  clearLogs,
}: NotificationLogStateResultInput) => ({
  swLogs,
  startLogCapture,
  clearLogs,
});
