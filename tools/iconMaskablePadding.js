// maskableアイコンはOS側で円形などに切り抜かれるため、
// 図柄を中央のセーフゾーンに収めて周囲を余白（padding）で埋める必要がある。
// この余白サイズの計算だけを純粋関数として切り出し、単体テスト可能にする。
const calculateMaskableSafeZonePadding = (size, safeZoneRatio) => {
  const innerSize = Math.round(size * safeZoneRatio);
  const padTotal = size - innerSize;
  const padStart = Math.floor(padTotal / 2);
  const padEnd = padTotal - padStart;

  return { innerSize, padStart, padEnd };
};

module.exports = { calculateMaskableSafeZonePadding };
