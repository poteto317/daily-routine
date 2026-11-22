import { MAX_BUG_REPORT_IMAGE_BYTES, MAX_BUG_REPORT_IMAGES } from "./constants";
import { isSupportedBugReportImageType } from "./imageSelection";

const readBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string" || !result.includes(",")) {
        reject(new Error("Could not encode report image"));
        return;
      }
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = reader.onabort = () =>
      reject(reader.error ?? new Error("Could not read report image"));
    reader.readAsDataURL(file);
  });

export function encodeBugReportImages(images: readonly File[]) {
  if (
    images.length > MAX_BUG_REPORT_IMAGES ||
    images.some(
      (file) =>
        !isSupportedBugReportImageType(file.type) ||
        file.size <= 0 ||
        file.size > MAX_BUG_REPORT_IMAGE_BYTES,
    )
  ) {
    throw new Error("Invalid report images");
  }
  return Promise.all(
    images.map(async (file) => ({
      contentType: file.type,
      base64: await readBase64(file),
    })),
  );
}
