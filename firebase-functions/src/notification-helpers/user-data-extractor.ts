import * as z from "zod";
import { notificationRoutine, notificationToken } from "../notification-schema";
import type { UserNotificationData } from "./types";

export type { UserNotificationData };

const storedRegistration = z.object({
  fcmToken: notificationToken,
  routines: z
    .array(
      notificationRoutine.extend({ isActive: z.boolean().optional() }).loose(),
    )
    .min(1),
});

/** 通知登録の保存値を検証し、無効な登録はスキップする。 */
export const extractUserNotificationData = (
  userData: unknown,
): UserNotificationData | null => {
  const result = storedRegistration.safeParse(userData);
  return result.success ? result.data : null;
};
