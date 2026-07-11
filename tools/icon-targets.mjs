import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { calculateMaskableSafeZonePadding } from "./iconMaskablePadding.js";

const BRAND_BACKGROUND = "#2563eb";

// maskableアイコンはOS側で円形などに切り抜かれるため、
// 図柄を中央80%（W3C推奨のセーフゾーン）に収めて周囲を背景色で埋める
const MASKABLE_SAFE_ZONE_RATIO = 0.8;

export const ICON_TARGETS = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "icon-maskable-192.png", size: 192, maskable: true },
  { file: "icon-maskable-512.png", size: 512, maskable: true },
  { file: "apple-touch-icon.png", size: 180, flatten: true },
];

const buildMaskableIconPipeline = (sharp, svgBuffer, size) => {
  const { innerSize, padStart, padEnd } = calculateMaskableSafeZonePadding(
    size,
    MASKABLE_SAFE_ZONE_RATIO,
  );

  return sharp(svgBuffer)
    .resize(innerSize, innerSize)
    .extend({
      top: padStart,
      bottom: padEnd,
      left: padStart,
      right: padEnd,
      background: BRAND_BACKGROUND,
    })
    .flatten({ background: BRAND_BACKGROUND });
};

const buildStandardIconPipeline = (sharp, svgBuffer, target) => {
  let pipeline = sharp(svgBuffer).resize(target.size, target.size);
  if (target.flatten) {
    // iOSのapple-touch-iconはアルファチャンネルを持たない画像が推奨されるため、
    // 背景色で不透明化してからPNGにエンコードする
    pipeline = pipeline.flatten({ background: BRAND_BACKGROUND });
  }
  return pipeline;
};

export const buildIconPipeline = (sharp, svgBuffer, target) => {
  if (target.maskable) {
    return buildMaskableIconPipeline(sharp, svgBuffer, target.size);
  }
  return buildStandardIconPipeline(sharp, svgBuffer, target);
};

export const readIconSvg = (workspaceRoot) => {
  const svgPath = join(workspaceRoot, "public", "icon.svg");

  if (!existsSync(svgPath)) {
    throw new Error(
      `アイコン生成元のSVGが見つかりません: ${svgPath}\nリポジトリのルートディレクトリで実行しているか確認してください。`,
    );
  }

  return readFileSync(svgPath);
};
