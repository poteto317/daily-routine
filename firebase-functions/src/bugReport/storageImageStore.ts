import { REPORT_IMAGE_URL_TTL_MINUTES } from "./imageFormats";
import type { ImageStore } from "./resolveReportImages";

const CACHE_CONTROL = "private, no-store, max-age=0";

export interface FileMetadataLike {
  readonly size?: unknown;
  readonly generation?: string | number;
  readonly metageneration?: string | number;
  readonly cacheControl?: string;
  readonly metadata?: {
    readonly firebaseStorageDownloadTokens?: unknown;
  };
}

export interface FileLike {
  getMetadata(): Promise<readonly [FileMetadataLike, ...unknown[]]>;
  download(): Promise<readonly [Buffer, ...unknown[]]>;
  setMetadata(
    metadata: {
      cacheControl: string;
      metadata: { firebaseStorageDownloadTokens: null };
    },
    conditions: { ifGenerationMatch: string; ifMetagenerationMatch: string },
  ): Promise<unknown>;
  getSignedUrl(options: {
    version: "v4";
    action: "read";
    expires: number;
    queryParams: { generation: string };
  }): Promise<readonly [string, ...unknown[]]>;
}

export interface BucketLike {
  file(path: string): FileLike;
}

function parseNonNegativeSize(raw: unknown): number | null {
  if (typeof raw === "number") {
    return Number.isFinite(raw) && raw >= 0 ? raw : null;
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  }
  return null;
}

function versionNumber(raw: string | number | undefined): string {
  const value = String(raw);
  if (
    !/^[1-9][0-9]*$/.test(value) ||
    (typeof raw === "number" && !Number.isSafeInteger(raw))
  ) {
    throw new Error("Invalid report image version metadata");
  }
  return value;
}

const needsProtection = (meta: FileMetadataLike): boolean =>
  meta.cacheControl !== CACHE_CONTROL ||
  meta.metadata?.firebaseStorageDownloadTokens != null;

/** 旧トークンをすべて削除し、同じオブジェクトの保護状態を確認する。 */
export async function ensurePrivateReportImage(
  file: Pick<FileLike, "getMetadata" | "setMetadata">,
  apply: boolean,
): Promise<{ generation: string; needsUpdate: boolean }> {
  const [meta] = await file.getMetadata();
  const generation = versionNumber(meta.generation);
  const needsUpdate = needsProtection(meta);
  if (!apply || !needsUpdate) return { generation, needsUpdate };

  await file.setMetadata(
    {
      cacheControl: CACHE_CONTROL,
      metadata: { firebaseStorageDownloadTokens: null },
    },
    {
      ifGenerationMatch: generation,
      ifMetagenerationMatch: versionNumber(meta.metageneration),
    },
  );
  const [updated] = await file.getMetadata();
  if (
    versionNumber(updated.generation) !== generation ||
    needsProtection(updated)
  ) {
    throw new Error("Report image access protection could not be verified");
  }
  return { generation, needsUpdate };
}

export function createStorageImageStore(
  bucket: BucketLike,
  now: () => number = Date.now,
): ImageStore {
  return {
    async getSize(path: string): Promise<number | null> {
      const [meta] = await bucket.file(path).getMetadata();
      return parseNonNegativeSize(meta?.size);
    },

    async download(path: string): Promise<Buffer> {
      const [buffer] = await bucket.file(path).download();
      return buffer;
    },

    async getDownloadUrl(path: string): Promise<string> {
      const file = bucket.file(path);
      const { generation } = await ensurePrivateReportImage(file, true);
      const [url] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires: now() + REPORT_IMAGE_URL_TTL_MINUTES * 60 * 1000,
        queryParams: { generation },
      });
      return url;
    },
  };
}
