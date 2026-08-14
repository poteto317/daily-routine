import { migrateMealDateKeys } from "@/features/meal/migrateMealDateKeys";
import { migrateWeightDateKeys } from "@/features/weight-tracker/migrateWeightDateKeys";
import { runOncePerUser } from "@/lib/storage/core";

const MIGRATION_MARKER_SUFFIX = "_date-key-migrated";

/**
 * UTC 基準で保存されていた日付キーを、正しい JST 日付へ移す。
 *
 * 片方が例外を投げても、もう片方は実行する。1 つのデータの不整合で
 * 別の機能の移行まで止めないため。
 *
 * @returns すべて成功したか
 */
export const migrateDateKeys = (): boolean => {
  let succeeded = true;

  const runSafely = (migrate: () => number) => {
    try {
      migrate();
    } catch {
      succeeded = false;
    }
  };

  runSafely(migrateWeightDateKeys);
  runSafely(migrateMealDateKeys);

  return succeeded;
};

/**
 * ログイン直後に 1 度だけ移行する。
 *
 * 手元のデータを直すのは 1 度で足りる。失敗した回は完了として記録せず、
 * 次回もう一度試す。
 *
 * クラウドから復元したデータには誤った日付キーが残っているため、
 * そちらは saveSyncDataToLocal が migrateDateKeys を直接呼ぶ。
 */
export const runDateKeyMigrationOnce = (uid: string): void => {
  runOncePerUser(uid, MIGRATION_MARKER_SUFFIX, migrateDateKeys);
};
