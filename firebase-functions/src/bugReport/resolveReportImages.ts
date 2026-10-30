import {
  IMAGE_FILE_NAME_PATTERN,
  type ImageMediaType,
  MAX_IMAGE_BYTES,
  MAX_REPORT_IMAGES,
  sniffImageMediaType,
} from "./imageFormats";

export interface WarnLogger {
  warn(message: string): void;
}

export interface ResolvedImage {
  readonly mediaType: ImageMediaType;
  readonly data: Buffer;
  readonly url: string;
}

export interface ResolveReportImagesResult {
  readonly images: ResolvedImage[];
  readonly skippedCount: number;
}

export interface ImageStore {
  getSize(path: string): Promise<number | null>;
  download(path: string): Promise<Buffer>;
  getDownloadUrl(path: string): Promise<string>;
}

export interface ResolveReportImagesParams {
  readonly uid: string;
  readonly reportId: string;
  readonly images: unknown;
  readonly store: ImageStore;
  readonly logger: WarnLogger;
}

type SkipReason =
  | "invalid_path"
  | "missing"
  | "too_large"
  | "download_failed"
  | "unsupported_format"
  | "url_failed";

export function countReferencedImages(images: unknown): number {
  if (!Array.isArray(images)) {
    return 0;
  }
  return Math.min(images.length, MAX_REPORT_IMAGES);
}

function extractValidPath(
  entry: unknown,
  uid: string,
  reportId: string,
): string | null {
  if (entry === null || typeof entry !== "object") {
    return null;
  }
  const path = (entry as { path?: unknown }).path;
  if (typeof path !== "string" || path.includes("..")) {
    return null;
  }
  const prefix = `bugReports/${uid}/${reportId}/`;
  if (!path.startsWith(prefix)) {
    return null;
  }
  const fileName = path.slice(prefix.length);
  if (!IMAGE_FILE_NAME_PATTERN.test(fileName)) {
    return null;
  }
  return path;
}

export async function resolveReportImages({
  uid,
  reportId,
  images,
  store,
  logger,
}: ResolveReportImagesParams): Promise<ResolveReportImagesResult> {
  if (!Array.isArray(images) || images.length === 0) {
    return { images: [], skippedCount: 0 };
  }

  const candidates = images.slice(0, MAX_REPORT_IMAGES);
  const resolved: ResolvedImage[] = [];
  let skippedCount = 0;

  const skipWithWarn = (index: number, reason: SkipReason): void => {
    skippedCount += 1;
    logger.warn(
      `[onBugReportCreated] Report ${reportId}: skipped image #${index + 1} (${reason})`,
    );
  };

  for (let i = 0; i < candidates.length; i += 1) {
    const path = extractValidPath(candidates[i], uid, reportId);
    if (!path) {
      skipWithWarn(i, "invalid_path");
      continue;
    }

    let size: number | null;
    try {
      size = await store.getSize(path);
    } catch {
      skipWithWarn(i, "missing");
      continue;
    }

    if (size === null || size <= 0) {
      skipWithWarn(i, "missing");
      continue;
    }

    if (size > MAX_IMAGE_BYTES) {
      skipWithWarn(i, "too_large");
      continue;
    }

    let data: Buffer;
    try {
      data = await store.download(path);
    } catch {
      skipWithWarn(i, "download_failed");
      continue;
    }

    if (data.length <= 0) {
      skipWithWarn(i, "missing");
      continue;
    }

    if (data.length > MAX_IMAGE_BYTES) {
      skipWithWarn(i, "too_large");
      continue;
    }

    const mediaType = sniffImageMediaType(data);
    if (!mediaType) {
      skipWithWarn(i, "unsupported_format");
      continue;
    }

    let url: string;
    try {
      url = await store.getDownloadUrl(path);
    } catch {
      skipWithWarn(i, "url_failed");
      continue;
    }

    resolved.push({ mediaType, data, url });
  }

  return { images: resolved, skippedCount };
}
