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

  it("storage.rules が上限サイズ・許可 MIME・ファイル名パターン・アクセス制御を含んでいる", () => {
    const storageRulesPath = path.join(repoRoot, "storage.rules");
    const storageRules = fs.readFileSync(storageRulesPath, "utf8");

    expect(MAX_BUG_REPORT_IMAGE_BYTES).toBe(5 * 1024 * 1024);
    expect(storageRules).toContain("request.resource.size <= 5 * 1024 * 1024");

    const mimeSubtypes = Object.keys(BUG_REPORT_IMAGE_EXTENSIONS)
      .map((mime) => mime.replace(/^image\//, ""))
      .join("|");
    expect(storageRules).toContain(
      `request.resource.contentType.matches('^image/(${mimeSubtypes})$')`,
    );

    const extJoined = Object.values(BUG_REPORT_IMAGE_EXTENSIONS).join("|");
    const expectedRuleRegex = `^[A-Za-z0-9_-]{1,64}\\\\.(${extJoined})$`;
    expect(storageRules).toContain(`fileName.matches('${expectedRuleRegex}')`);
    expect(expectedRuleRegex.replace("\\\\.", "\\.")).toBe(
      IMAGE_FILE_NAME_PATTERN.source,
    );

    expect(storageRules).toContain(
      "match /bugReports/{uid}/{reportId}/{fileName}",
    );
    expect(storageRules).toContain("request.auth != null");
    expect(storageRules).toContain("request.auth.uid == uid");
    expect(storageRules).toContain("allow read, update: if false;");
    expect(storageRules).toContain("match /{allPaths=**}");
    expect(storageRules).toContain("allow read, write: if false;");
  });

  it("firestore.rules の bugReports create に images の検証と hasOnly への追加があり update/delete 拒否が維持されている", () => {
    const firestoreRulesPath = path.join(repoRoot, "firestore.rules");
    const firestoreRules = fs.readFileSync(firestoreRulesPath, "utf8");

    expect(firestoreRules).toContain(
      `(!('images' in request.resource.data) || (request.resource.data.images is list && request.resource.data.images.size() <= ${MAX_BUG_REPORT_IMAGES}))`,
    );

    const bugReportsBlockMatch = firestoreRules.match(
      /match \/bugReports\/\{reportId\} \{[\s\S]*?allow update, delete: if false;\s*\}/,
    );
    expect(bugReportsBlockMatch).not.toBeNull();
    const bugReportsBlock = bugReportsBlockMatch![0];
    expect(bugReportsBlock).toContain('"images"');
    expect(bugReportsBlock).toContain("allow update, delete: if false;");
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
