import { randomUUID } from "node:crypto";

import type { ImageStore } from "./resolveReportImages";

export interface FileMetadataLike {
  readonly size?: unknown;
  readonly metadata?: {
    readonly firebaseStorageDownloadTokens?: unknown;
  };
}

export interface FileLike {
  getMetadata(): Promise<readonly [FileMetadataLike, ...unknown[]]>;
  download(): Promise<readonly [Buffer, ...unknown[]]>;
  setMetadata(metadata: object): Promise<unknown>;
}

export interface BucketLike {
  readonly name: string;
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

function extractFirstToken(raw: unknown): string | null {
  if (typeof raw !== "string") {
    return null;
  }
  const first = raw
    .split(",")
    .map((part) => part.trim())
    .find((part) => part.length > 0);
  return first ?? null;
}

export function createStorageImageStore(
  bucket: BucketLike,
  generateToken: () => string = randomUUID,
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
      const [meta] = await file.getMetadata();
      let token = extractFirstToken(
        meta?.metadata?.firebaseStorageDownloadTokens,
      );

      if (!token) {
        token = generateToken();
        await file.setMetadata({
          metadata: {
            firebaseStorageDownloadTokens: token,
          },
        });
      }

      const encodedPath = encodeURIComponent(path);
      return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;
    },
  };
}
