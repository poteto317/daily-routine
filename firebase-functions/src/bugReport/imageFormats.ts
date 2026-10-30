export type ImageMediaType =
  | "image/png"
  | "image/jpeg"
  | "image/webp"
  | "image/gif";

export const MAX_REPORT_IMAGES = 3;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_FILE_NAME_PATTERN =
  /^[A-Za-z0-9_-]{1,64}\.(png|jpg|webp|gif)$/;

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;

export function sniffImageMediaType(buf: Buffer): ImageMediaType | null {
  if (
    buf.length >= PNG_MAGIC.length &&
    PNG_MAGIC.every((byte, idx) => buf[idx] === byte)
  ) {
    return "image/png";
  }

  if (
    buf.length >= 3 &&
    buf[0] === 0xff &&
    buf[1] === 0xd8 &&
    buf[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (buf.length >= 6) {
    const header6 = buf.subarray(0, 6).toString("ascii");
    if (header6 === "GIF87a" || header6 === "GIF89a") {
      return "image/gif";
    }
  }

  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}
