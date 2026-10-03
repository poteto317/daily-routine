import { readFileSync } from "node:fs";
import { join } from "node:path";

const packageJson = JSON.parse(
  readFileSync(
    join(__dirname, "..", "..", "firebase-functions", "package.json"),
    "utf8",
  ),
) as { scripts: Record<string, string> };

/**
 * ファイルをディレクトリに分割（validation.ts → validation/）したあとに、tsc だけでビルドすると、
 * 消えたソースの古い出力（lib/validation.js）が残る。Node の require("./validation") は
 * ファイルをディレクトリより先に解決するため、古い実装が読み込まれ、デプロイした関数が壊れる。
 * ローカルのテスト（ts-jest）は TypeScript のソースを読むため、この不具合を検出できない。
 * そこで、ビルドが lib を削除してから行われることを固定する。
 */
describe("firebase-functions のビルドスクリプト", () => {
  it("build は、tsc の前に clean（lib の削除）を実行する", () => {
    const { build } = packageJson.scripts;
    expect(build).toContain("clean");
    expect(build.indexOf("clean")).toBeLessThan(build.indexOf("tsc"));
  });

  it("clean は lib ディレクトリを再帰的に削除する（存在しなくても失敗しない）", () => {
    const { clean } = packageJson.scripts;
    expect(clean).toContain("rmSync");
    expect(clean).toContain("lib");
    expect(clean).toContain("recursive: true");
    expect(clean).toContain("force: true");
  });

  it("firebase.json の predeploy は build を使う（デプロイ前に必ず clean が走る）", () => {
    const firebaseJson = JSON.parse(
      readFileSync(join(__dirname, "..", "..", "firebase.json"), "utf8"),
    ) as { functions: { predeploy: string[] }[] };
    const predeploy = firebaseJson.functions.flatMap((f) => f.predeploy);
    expect(predeploy.some((command) => command.includes("run build"))).toBe(
      true,
    );
  });
});
