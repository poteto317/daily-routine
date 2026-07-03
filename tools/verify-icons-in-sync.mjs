import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import {
  ICON_TARGETS,
  buildIconPipeline,
  readIconSvg,
} from "./icon-targets.mjs";

// エンコード済みPNGのバイト列はOS/アーキテクチャ差異（sharpのプリビルドバイナリの違い）で
// 一致しないことがあるため、デコード後の生ピクセルデータを比較する。
const workspaceRoot = process.cwd();
const svgBuffer = readIconSvg(workspaceRoot);

let hasDrift = false;

for (const target of ICON_TARGETS) {
  const outputPath = join(workspaceRoot, "public", target.file);

  if (!existsSync(outputPath)) {
    console.error(
      `✗ ${target.file} が存在しません。npm run generate:icons を実行してコミットしてください。`,
    );
    hasDrift = true;
    continue;
  }

  const expected = await buildIconPipeline(sharp, svgBuffer, target)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const actual = await sharp(readFileSync(outputPath))
    .raw()
    .toBuffer({ resolveWithObject: true });

  const sameSize =
    expected.info.width === actual.info.width &&
    expected.info.height === actual.info.height &&
    expected.info.channels === actual.info.channels;

  const samePixels = sameSize && expected.data.equals(actual.data);

  if (!samePixels) {
    console.error(
      `✗ ${target.file} が public/icon.svg と一致しません。npm run generate:icons を実行して再コミットしてください。`,
    );
    hasDrift = true;
  } else {
    console.log(`✓ ${target.file} は public/icon.svg と一致しています`);
  }
}

if (hasDrift) {
  process.exit(1);
}
