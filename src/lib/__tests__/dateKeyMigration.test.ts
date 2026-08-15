jest.mock("@/features/weight-tracker/migrateWeightDateKeys", () => ({
  migrateWeightDateKeys: jest.fn(() => 0),
}));
jest.mock("@/features/meal/migrateMealDateKeys", () => ({
  migrateMealDateKeys: jest.fn(() => 0),
}));

import { migrateMealDateKeys } from "@/features/meal/migrateMealDateKeys";
import { migrateWeightDateKeys } from "@/features/weight-tracker/migrateWeightDateKeys";
import { migrateDateKeys, runDateKeyMigrationOnce } from "../dateKeyMigration";

describe("runDateKeyMigrationOnce", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // clearAllMocks は呼び出し履歴だけを消す。前のテストで差し替えた
    // 実装が残ると、後続のテストが意図しない結果になる
    (migrateWeightDateKeys as jest.Mock).mockImplementation(() => 0);
    (migrateMealDateKeys as jest.Mock).mockImplementation(() => 0);
    localStorage.clear();
  });

  it("体重と食事の移行を実行する", () => {
    runDateKeyMigrationOnce("uid-1");

    expect(migrateWeightDateKeys).toHaveBeenCalledTimes(1);
    expect(migrateMealDateKeys).toHaveBeenCalledTimes(1);
  });

  it("2 度目以降は実行しない", () => {
    // 移行は元に戻せない。取りこぼしを防ぐより、二重適用を防ぐ方を優先する
    runDateKeyMigrationOnce("uid-1");
    jest.clearAllMocks();

    runDateKeyMigrationOnce("uid-1");

    expect(migrateWeightDateKeys).not.toHaveBeenCalled();
    expect(migrateMealDateKeys).not.toHaveBeenCalled();
  });

  it("ユーザーごとに 1 度ずつ実行する", () => {
    runDateKeyMigrationOnce("uid-1");
    jest.clearAllMocks();

    runDateKeyMigrationOnce("uid-2");

    expect(migrateWeightDateKeys).toHaveBeenCalledTimes(1);
  });

  it("片方が例外を投げてももう片方は実行する", () => {
    // 1 つのデータの不整合で、もう一方の移行まで止めない
    (migrateWeightDateKeys as jest.Mock).mockImplementation(() => {
      throw new Error("boom");
    });

    expect(() => runDateKeyMigrationOnce("uid-1")).not.toThrow();
    expect(migrateMealDateKeys).toHaveBeenCalledTimes(1);
  });

  it("例外が起きた場合は次回もう一度試す", () => {
    // 失敗したまま完了扱いにすると、直せる機会を永久に失う
    (migrateWeightDateKeys as jest.Mock).mockImplementation(() => {
      throw new Error("boom");
    });
    runDateKeyMigrationOnce("uid-1");
    (migrateWeightDateKeys as jest.Mock).mockImplementation(() => 0);
    jest.clearAllMocks();

    runDateKeyMigrationOnce("uid-1");

    expect(migrateWeightDateKeys).toHaveBeenCalledTimes(1);
  });
});

describe("migrateDateKeys", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // clearAllMocks は呼び出し履歴だけを消す。前のテストで差し替えた
    // 実装が残ると、後続のテストが意図しない結果になる
    (migrateWeightDateKeys as jest.Mock).mockImplementation(() => 0);
    (migrateMealDateKeys as jest.Mock).mockImplementation(() => 0);
    localStorage.clear();
  });

  it("マーカーに関係なく実行する", () => {
    // クラウドから復元したデータには誤った日付キーが残っている。
    // 1 度きりの制御に縛られると、復元のたびに直せなくなる。
    runDateKeyMigrationOnce("uid-1");
    jest.clearAllMocks();

    migrateDateKeys();

    expect(migrateWeightDateKeys).toHaveBeenCalledTimes(1);
    expect(migrateMealDateKeys).toHaveBeenCalledTimes(1);
  });

  it("片方が例外を投げてももう片方は実行する", () => {
    (migrateWeightDateKeys as jest.Mock).mockImplementation(() => {
      throw new Error("boom");
    });

    expect(() => migrateDateKeys()).not.toThrow();
    expect(migrateMealDateKeys).toHaveBeenCalledTimes(1);
  });

  it("すべて成功したかを返す", () => {
    expect(migrateDateKeys()).toBe(true);

    (migrateWeightDateKeys as jest.Mock).mockImplementation(() => {
      throw new Error("boom");
    });
    expect(migrateDateKeys()).toBe(false);
  });

  it("移行が例外を投げてもログイン処理を止めない", () => {
    // runDateKeyMigrationOnce はログイン直後の準備処理から同期的に
    // 呼ばれる。例外が抜けるとログインそのものが失敗する。
    (migrateWeightDateKeys as jest.Mock).mockImplementation(() => {
      throw new Error("boom");
    });
    (migrateMealDateKeys as jest.Mock).mockImplementation(() => {
      throw new Error("boom");
    });

    expect(() => runDateKeyMigrationOnce("uid-1")).not.toThrow();
  });
});
