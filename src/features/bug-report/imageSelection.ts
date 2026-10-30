import {
  BUG_REPORT_IMAGE_EXTENSIONS,
  type BugReportImageMimeType,
  MAX_BUG_REPORT_IMAGE_BYTES,
  MAX_BUG_REPORT_IMAGES,
} from "./constants";

export type BugReportImageError = "unsupportedType" | "tooLarge" | "tooMany";

export interface SelectBugReportImagesResult {
  readonly next: File[];
  readonly errors: BugReportImageError[];
}

export function isSupportedBugReportImageType(
  type: string,
): type is BugReportImageMimeType {
  return Object.prototype.hasOwnProperty.call(
    BUG_REPORT_IMAGE_EXTENSIONS,
    type,
  );
}

const ERROR_ORDER: readonly BugReportImageError[] = [
  "unsupportedType",
  "tooLarge",
  "tooMany",
];

/**
 * 現在選択されている画像に新しく選択された画像を追加し、上限・形式・サイズを検証する純粋関数。
 */
export function selectBugReportImages(
  current: readonly File[],
  incoming: readonly File[],
): SelectBugReportImagesResult {
  const next = [...current];
  const errorSet = new Set<BugReportImageError>();

  for (const file of incoming) {
    if (!isSupportedBugReportImageType(file.type) || file.size <= 0) {
      errorSet.add("unsupportedType");
      continue;
    }

    if (file.size > MAX_BUG_REPORT_IMAGE_BYTES) {
      errorSet.add("tooLarge");
      continue;
    }

    if (next.length >= MAX_BUG_REPORT_IMAGES) {
      errorSet.add("tooMany");
      continue;
    }

    next.push(file);
  }

  const errors = ERROR_ORDER.filter((err) => errorSet.has(err));
  return { next, errors };
}
