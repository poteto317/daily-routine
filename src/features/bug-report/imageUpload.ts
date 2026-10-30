import {
  deleteObject,
  ref,
  uploadBytes,
  type FirebaseStorage,
} from "firebase/storage";
import {
  BUG_REPORT_IMAGE_EXTENSIONS,
  BUG_REPORTS_COLLECTION,
  MAX_BUG_REPORT_IMAGE_BYTES,
  MAX_BUG_REPORT_IMAGES,
} from "./constants";
import { isSupportedBugReportImageType } from "./imageSelection";
import type { BugReportImage } from "./types";

const BASE64URL_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/**
 * 22 バイトの暗号論的乱数から 22 文字の base64url 文字列を作る。
 */
export function defaultCreateFileId(): string {
  const bytes = new Uint8Array(22);
  crypto.getRandomValues(bytes);
  let id = "";
  for (let i = 0; i < bytes.length; i += 1) {
    id += BASE64URL_ALPHABET[bytes[i]! & 63];
  }
  return id;
}

export interface UploadBugReportImagesParams {
  readonly storage: FirebaseStorage;
  readonly uid: string;
  readonly reportId: string;
  readonly images: readonly File[];
  readonly createFileId?: () => string;
}

function validateImagesBeforeUpload(images: readonly File[]): void {
  if (images.length > MAX_BUG_REPORT_IMAGES) {
    throw new Error("添付できる画像の上限を超えています");
  }
  for (const file of images) {
    if (!isSupportedBugReportImageType(file.type)) {
      throw new Error("対応していない画像形式です");
    }
    if (file.size <= 0 || file.size > MAX_BUG_REPORT_IMAGE_BYTES) {
      throw new Error("画像のサイズ上限を超えているか空のファイルです");
    }
  }
}

/**
 * 指定した Storage パスの画像をベストエフォートで削除する（失敗しても例外を投げない）。
 */
export async function deleteBugReportImages(
  storage: FirebaseStorage,
  paths: readonly string[],
): Promise<void> {
  if (paths.length === 0) {
    return;
  }
  await Promise.allSettled(
    paths.map((path) => deleteObject(ref(storage, path))),
  );
}

/**
 * 不具合報告の添付画像を Storage へアップロードする。
 * 途中で失敗した場合はそれまでにアップロードした画像をベストエフォートで削除してから元の例外を投げる。
 */
export async function uploadBugReportImages({
  storage,
  uid,
  reportId,
  images,
  createFileId = defaultCreateFileId,
}: UploadBugReportImagesParams): Promise<BugReportImage[]> {
  if (images.length === 0) {
    return [];
  }
  validateImagesBeforeUpload(images);

  const uploaded: BugReportImage[] = [];
  try {
    for (const file of images) {
      if (!isSupportedBugReportImageType(file.type)) {
        throw new Error("対応していない画像形式です");
      }
      const ext = BUG_REPORT_IMAGE_EXTENSIONS[file.type];
      const path = `${BUG_REPORTS_COLLECTION}/${uid}/${reportId}/${createFileId()}.${ext}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file, { contentType: file.type });
      uploaded.push({
        path,
        contentType: file.type,
        size: file.size,
      });
    }
    return uploaded;
  } catch (error) {
    await deleteBugReportImages(
      storage,
      uploaded.map((item) => item.path),
    );
    throw error;
  }
}
