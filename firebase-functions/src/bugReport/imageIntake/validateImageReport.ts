import { HttpsError } from "firebase-functions/v2/https";
import { z } from "zod";
import {
  MAX_IMAGE_BYTES,
  MAX_REPORT_IMAGES,
  sniffImageMediaType,
  type ImageMediaType,
} from "../imageFormats";

const maxEncodedLength = 4 * Math.ceil(MAX_IMAGE_BYTES / 3);
const reportSchema = z.object({
  description: z.string().trim().min(1).max(2000),
  title: z.string().trim().max(100).default(""),
  stepsToReproduce: z.string().trim().max(2000).default(""),
  meta: z.object({
    appVersion: z.string().max(50),
    userAgent: z.string().max(500),
    url: z.string().max(2000),
    locale: z.string().max(20),
    timezone: z.string().max(30),
    createdAtClient: z.string().max(30),
  }),
  images: z
    .array(
      z.object({
        base64: z.string().min(4).max(maxEncodedLength),
        contentType: z.string().max(10),
      }),
    )
    .min(1)
    .max(MAX_REPORT_IMAGES),
});

export type ImageReportFields = Omit<z.output<typeof reportSchema>, "images">;
export type DecodedReportImage = {
  bytes: Buffer;
  contentType: ImageMediaType;
};

export function validateImageReport(input: unknown): {
  fields: ImageReportFields;
  images: DecodedReportImage[];
} {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success)
    throw new HttpsError("invalid-argument", "Invalid report");
  const { images, ...fields } = parsed.data;
  return {
    fields,
    images: images.map(({ base64, contentType }) => {
      const bytes = Buffer.from(base64, "base64");
      const actualType = sniffImageMediaType(bytes);
      if (
        bytes.length > MAX_IMAGE_BYTES ||
        !actualType ||
        actualType !== contentType ||
        bytes.toString("base64") !== base64
      ) {
        throw new HttpsError("invalid-argument", "Invalid report image");
      }
      return { bytes, contentType: actualType };
    }),
  };
}
