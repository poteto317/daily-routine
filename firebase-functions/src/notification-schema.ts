import * as z from "zod";

export const notificationRoutine = z.object({
  id: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[^/]+$/),
  title: z.string(),
  startTime: z.string().regex(/^(?:[01]?\d|2[0-3]):[0-5]\d$/),
  daysOfWeek: z.array(z.number().int().min(0).max(7)),
  notificationMinutes: z.number().finite().optional(),
  holidayMode: z.enum(["normal", "include", "exclude", "only"]).optional(),
});

export const notificationToken = z
  .string()
  .min(1)
  .max(1024)
  .regex(/^[A-Za-z0-9_.:+-]+$/);
