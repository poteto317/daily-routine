import { findShiftedDateKey } from "@/lib/dateKeyShift";
import { getWeightHistory, saveWeightHistory } from "./storageData";

/**
 * UTC 基準で保存されていた体重記録を、正しい JST 日付へ移す。
 *
 * 体重は 1 日 1 件のため、移し先が埋まっている場合は移さない。夜に記録した
 * 正しい記録を消さないため。
 *
 * 先に「動かさない記録」だけを新しい入れ物へ移し、そのうえで動かす記録を
 * 詰めていく。移動前の状態で移し先を判定すると、毎朝記録していた場合に
 * すべての記録が 1 日ずつ後ろへ動くため「移し先が埋まっている」と誤って
 * 判定し、1 件も動かせなくなる。
 *
 * @returns 移した件数
 */
export const migrateWeightDateKeys = (): number => {
  const history = getWeightHistory();

  const plans = Object.entries(history).map(([dateKey, record]) => ({
    dateKey,
    record,
    targetKey: findShiftedDateKey(dateKey, record?.createdAt),
  }));

  const migrated: typeof history = {};
  for (const plan of plans) {
    if (plan.targetKey) continue;
    migrated[plan.dateKey] = plan.record;
  }

  let movedCount = 0;
  for (const plan of plans) {
    const { targetKey } = plan;
    if (!targetKey) continue;

    // 動かさない記録と、先に移ってきた記録の両方をここで避ける。
    //
    // キーの有無ではなく中身の有無で見る。localStorage の値は内側の形まで
    // 検証していないため、キーはあるのに中身が null という状態がありうる。
    // それを「埋まっている」と扱うと、中身の無い日付が居座り、正しい記録が
    // 誤った日付に取り残される。実データで置き換えるほうが良い。
    if (migrated[targetKey]) {
      migrated[plan.dateKey] = plan.record;
      continue;
    }

    migrated[targetKey] = { ...plan.record, date: targetKey };
    movedCount += 1;
  }

  // 移すものが無ければ保存し直さない。無駄な書き込みで更新時刻が進み、
  // 同期に不要な差分を作ってしまう。
  if (movedCount > 0) {
    saveWeightHistory(migrated);
  }

  return movedCount;
};
