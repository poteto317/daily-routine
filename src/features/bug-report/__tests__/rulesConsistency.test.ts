/** @jest-environment node */
import fs from "node:fs";
import path from "node:path";
import {
  IMAGE_FILE_NAME_PATTERN,
  MAX_IMAGE_BYTES,
  MAX_REPORT_IMAGES,
} from "../../../../firebase-functions/src/bugReport/imageFormats";
import {
  BUG_REPORT_IMAGE_EXTENSIONS,
  MAX_BUG_REPORT_IMAGE_BYTES,
  MAX_BUG_REPORT_IMAGES,
} from "../constants";

const repoRoot = path.resolve(__dirname, "../../../..");

describe("rulesConsistency (Storage・Firestore・クライアント・サーバー定数の整合)", () => {
  it("クライアントとサーバーの画像上限値・拡張子が一致している", () => {
    expect(MAX_IMAGE_BYTES).toBe(MAX_BUG_REPORT_IMAGE_BYTES);
    expect(MAX_REPORT_IMAGES).toBe(MAX_BUG_REPORT_IMAGES);

    const extJoined = Object.values(BUG_REPORT_IMAGE_EXTENSIONS).join("|");
    expect(IMAGE_FILE_NAME_PATTERN.source).toBe(
      `^[A-Za-z0-9_-]{1,64}\\.(${extJoined})$`,
    );
  });

  it("Storage はクライアントの画像書き込みを拒否する", () => {
    const rules = fs.readFileSync(path.join(repoRoot, "storage.rules"), "utf8");
    const permissions = rules.match(/allow [^;]+;/g);

    expect(permissions).toEqual(["allow read, write: if false;"]);
  });

  it("Firestore のクライアント報告では画像参照を受け付けない", () => {
    const rules = fs.readFileSync(
      path.join(repoRoot, "firestore.rules"),
      "utf8",
    );
    const block = rules.match(
      /match \/bugReports\/\{reportId\} \{[\s\S]*?allow update, delete: if false;\s*\}/,
    )?.[0];

    expect(block).toBeDefined();
    expect(block).toContain("keys().hasOnly([");
    expect(block).toContain('"description"');
    expect(block).not.toContain('"images"');
  });

  it("firebase.json に storage.rules が設定されている", () => {
    const firebaseJsonPath = path.join(repoRoot, "firebase.json");
    const firebaseConfig = JSON.parse(
      fs.readFileSync(firebaseJsonPath, "utf8"),
    ) as {
      storage?: { rules?: string };
    };
    expect(firebaseConfig.storage?.rules).toBe("storage.rules");
  });
});
