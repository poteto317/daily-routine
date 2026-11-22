import type { Request } from "firebase-functions/https";
import * as z from "zod";

import { notificationRoutine, notificationToken } from "../notification-schema";

const syncRequest = z.strictObject({
  token: notificationToken,
  routines: z.array(notificationRoutine),
});

export const parseSyncRequestBody = (req: Request) =>
  syncRequest.safeParse(req.body);

export const isPostMethod = (method: string): boolean => method === "POST";
