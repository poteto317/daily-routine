import type { Routine } from "@/types/routine";

export type NotificationRoutine = Pick<
  Routine,
  "id" | "title" | "startTime" | "daysOfWeek" | "notificationMinutes"
>;

export const syncEndpoint = (base: string): string | null => {
  const url = new URL(base);
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) {
    return null;
  }
  if (url.username || url.password || url.search || url.hash) return null;
  url.pathname = url.pathname.replace(/\/+$/, "") + "/syncRoutines";
  return url.href;
};

export const postNotificationRoutines = async (
  endpoint: string,
  idToken: string,
  token: string,
  routines: NotificationRoutine[],
): Promise<boolean | "owner-mismatch"> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ token, routines }),
      redirect: "error",
      signal: controller.signal,
    });
    if (response.status === 403) {
      const result = await response.json();
      return result?.code === "subscription-owner-mismatch"
        ? "owner-mismatch"
        : false;
    }
    if (!response.ok) return false;
    const result = await response.json();
    return result?.success === true;
  } finally {
    clearTimeout(timeout);
  }
};
