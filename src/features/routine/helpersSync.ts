import type { Routine } from "@/types/routine";
import { getFCMToken } from "@/lib/firebase";

export const syncRoutinesToFirebase = async (
  routines: Routine[],
  functionsUrl?: string,
): Promise<boolean> => {
  const fcmToken = await getFCMToken().catch(() => null);
  if (!fcmToken) return false;

  const url = functionsUrl || process.env.NEXT_PUBLIC_FUNCTIONS_URL;
  if (!url) return false;

  try {
    const response = await fetch(`${url}/syncRoutines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: fcmToken,
        routines,
      }),
    });

    if (!response.ok)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const result = await response.json();
    return result.success === true;
  } catch {
    return false;
  }
};
