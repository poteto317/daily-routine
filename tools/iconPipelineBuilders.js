const { calculateMaskableSafeZonePadding } = require("./iconMaskablePadding.js");

const BRAND_BACKGROUND = "#2563eb";

// maskableアイコンはOS側で円形などに切り抜かれるため、
// 図柄を中央80%（W3C推奨のセーフゾーン）に収めて周囲を背景色で埋める
const MASKABLE_SAFE_ZONE_RATIO = 0.8;

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

const buildIconPipeline = (sharp, svgBuffer, target) => {
  if (target.maskable) {
    return buildMaskableIconPipeline(sharp, svgBuffer, target.size);
  }
  return buildStandardIconPipeline(sharp, svgBuffer, target);
};

module.exports = {
  BRAND_BACKGROUND,
  MASKABLE_SAFE_ZONE_RATIO,
  buildMaskableIconPipeline,
  buildStandardIconPipeline,
  buildIconPipeline,
};
