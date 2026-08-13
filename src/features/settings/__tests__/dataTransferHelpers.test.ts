import {
  ALL_TRANSFER_OPTIONS,
  EMPTY_TRANSFER_OPTIONS,
} from "../state/constants";
import {
  createExportData,
  getSelectedTypeLabels,
  importSelectedData,
} from "../state/dataTransferHelpers";
import { TRANSFER_GROUPS } from "../state/dataTransferGroups";
import { getTodoLists, saveTodoLists } from "@/features/todo-lists/storage";
import { getPresets, savePresets } from "@/features/preset/storage";
import {
  getDailyProgress,
  saveDailyProgress,
} from "@/features/routine/storage";

/** 指定したキーだけを選んだ状態を作る */
const select = (...keys: (keyof typeof EMPTY_TRANSFER_OPTIONS)[]) =>
  keys.reduce(
    (options, key) => ({ ...options, [key]: true }),
    EMPTY_TRANSFER_OPTIONS,
  );

describe("createExportData", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("書き出した日時とバージョンを含める", () => {
    const data = createExportData(EMPTY_TRANSFER_OPTIONS);

    expect(typeof data.exportDate).toBe("string");
    expect(data.version).toBe("3.0");
  });

  it("選択したグループのデータだけを含める", () => {
    const data = createExportData(select("todoLists"));

    expect(data).toHaveProperty("todoLists");
    expect(data).toHaveProperty("todoCategories");
    expect(data).not.toHaveProperty("routines");
    expect(data).not.toHaveProperty("budgetData");
  });

  it("今日の進捗が無い日は progress を書き出さない", () => {
    // getDailyProgress は記録が無いとき null を返す。null を書き出しても
    // saveDailyProgress は null を受け取れず復元できないため、
    // 「ファイルに入っているものは戻る」という約束が崩れる。
    localStorage.clear();

    const data = createExportData(select("progress"));

    expect(data).not.toHaveProperty("progress");
  });

  it("今日の進捗があれば書き出して取り込める", () => {
    localStorage.clear();
    saveDailyProgress({
      date: "2026-08-13",
      completedRoutineIds: ["routine-1"],
      lastResetTime: "2026-08-13T00:00:00.000Z",
    });

    const data = createExportData(select("progress"));
    localStorage.clear();
    importSelectedData(data, select("progress"));

    expect(getDailyProgress()?.completedRoutineIds).toEqual(["routine-1"]);
  });

  it("何も選ばなければデータを含めない", () => {
    const data = createExportData(EMPTY_TRANSFER_OPTIONS);

    expect(Object.keys(data).sort()).toEqual(["exportDate", "version"]);
  });

  it("すべて選ぶと全グループの collect が呼ばれる", () => {
    // 選択できるのに書き出されないグループがあると、バックアップとして成立しない
    const spies = TRANSFER_GROUPS.map((group) => jest.spyOn(group, "collect"));

    createExportData(ALL_TRANSFER_OPTIONS);

    spies.forEach((spy) => expect(spy).toHaveBeenCalledTimes(1));
  });
});

describe("importSelectedData", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  it("選択したグループだけを復元する", () => {
    const restoreSpies = new Map(
      TRANSFER_GROUPS.map((group) => [
        group.key,
        jest.spyOn(group, "restore").mockImplementation(() => {}),
      ]),
    );

    importSelectedData({ routines: [] }, select("routines"));

    expect(restoreSpies.get("routines")).toHaveBeenCalledTimes(1);
    expect(restoreSpies.get("budget")).not.toHaveBeenCalled();
    expect(restoreSpies.get("todoLists")).not.toHaveBeenCalled();
  });

  it("ファイルに該当データが無いグループは手元のデータを残す", () => {
    // 旧バージョンで書き出したファイルには新しいグループのキーが存在しない。
    // 既定値で上書きすると手元のデータを消してしまう。
    saveTodoLists([
      { id: "1", title: "残ってほしいリスト", items: [] },
    ] as unknown as Parameters<typeof saveTodoLists>[0]);

    importSelectedData({ routines: [] }, ALL_TRANSFER_OPTIONS);

    expect(getTodoLists()).toHaveLength(1);
  });

  it("更新時刻の書き込みを1回にまとめる", () => {
    // 各グループが個別に保存すると、保存のたびに更新時刻が書かれ、
    // そのたびに LOCAL_DATA_UPDATED_AT_EVENT が飛んで購読側が読み直す。
    // 同期側の saveSyncDataToLocal と同じくバッチにまとめる。
    const setItem = jest.spyOn(Storage.prototype, "setItem");

    importSelectedData(
      { routines: [], todoLists: [], todoCategories: [], presets: [] },
      ALL_TRANSFER_OPTIONS,
    );

    const timestampWrites = setItem.mock.calls.filter(([key]) =>
      String(key).includes("local-data-updated-at"),
    );
    expect(timestampWrites).toHaveLength(1);
  });

  it("取り込んだあとに更新時刻を進める", () => {
    // 進めないと、クラウド同期がローカルを「古いまま」と判断して
    // 取り込んだ内容を上書きしてしまう
    const before = Date.now();

    importSelectedData({ routines: [] }, select("routines"));

    const stored = Object.entries(localStorage).find(([key]) =>
      key.includes("local-data-updated-at"),
    );
    expect(stored).toBeDefined();
    expect(Number(stored?.[1])).toBeGreaterThanOrEqual(before);
  });

  it("ルーティンが配列でなければエラーにする", () => {
    expect(() =>
      importSelectedData(
        { routines: "invalid" } as Record<string, unknown>,
        select("routines"),
      ),
    ).toThrow();
  });

  it("取り込む対象が1つも無ければ更新時刻を進めない", () => {
    // 旧バージョンのファイルに新しいグループのデータは入っていない。
    // 何も書き換えていないのに更新時刻だけ進めると、クラウド同期が
    // ローカルを「新しい」と判断し、他端末の新しいデータを上書きしてしまう。
    importSelectedData({ version: "2.0", routines: [] }, select("budget"));

    const stored = Object.entries(localStorage).find(([key]) =>
      key.includes("local-data-updated-at"),
    );
    expect(stored).toBeUndefined();
  });

  it("途中の項目が壊れていたら1件も書き換えない", () => {
    // 書きながら検証すると、エラーより前のグループだけが置き換わる。
    // ユーザーには「インポート失敗」と出るのに手元のデータは変わっており、
    // どこまで反映されたか分からない状態になる。
    saveTodoLists([
      { id: "keep", title: "元のリスト", items: [] },
    ] as unknown as Parameters<typeof saveTodoLists>[0]);

    expect(() =>
      importSelectedData(
        {
          todoLists: [{ id: "new", title: "新しいリスト", items: [] }],
          presets: "invalid",
        } as Record<string, unknown>,
        ALL_TRANSFER_OPTIONS,
      ),
    ).toThrow();

    expect(getTodoLists()[0].title).toBe("元のリスト");
  });

  it("Todoリストが配列でなければエラーにする", () => {
    // 形を確かめずに保存すると、読み出し側のガードで既定値に落ち、
    // エラーも出ないままリストが消えたように見える
    expect(() =>
      importSelectedData(
        { todoLists: "invalid" } as Record<string, unknown>,
        select("todoLists"),
      ),
    ).toThrow();
  });

  it("家計簿の項目が配列でなければエラーにする", () => {
    expect(() =>
      importSelectedData(
        { budgetIncomeItems: "invalid" } as Record<string, unknown>,
        select("budget"),
      ),
    ).toThrow();
  });

  it("記録がオブジェクトでなければエラーにする", () => {
    expect(() =>
      importSelectedData(
        { journalHistory: [] } as Record<string, unknown>,
        select("records"),
      ),
    ).toThrow();
  });

  it("プリセットが配列でなければエラーにする", () => {
    expect(() =>
      importSelectedData(
        { presets: "invalid" } as Record<string, unknown>,
        select("presets"),
      ),
    ).toThrow();
  });

  it("履歴がオブジェクトでなければエラーにする", () => {
    expect(() =>
      importSelectedData(
        { history: "invalid" } as Record<string, unknown>,
        select("history"),
      ),
    ).toThrow();
  });
});

describe("書き出してから取り込む", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("全グループを書き出して取り込むと元の内容に戻る", () => {
    // 「バックアップ」として成立するかは、往復して同じになるかで決まる。
    // 収集と復元でキー名がずれていると、個別のテストは通るのにここで落ちる。
    saveTodoLists([
      { id: "list-1", title: "買い物", items: [] },
    ] as unknown as Parameters<typeof saveTodoLists>[0]);
    savePresets([{ id: "preset-1", name: "朝の支度" }] as unknown as Parameters<
      typeof savePresets
    >[0]);

    const exported = createExportData(ALL_TRANSFER_OPTIONS);
    localStorage.clear();
    expect(getTodoLists()).toHaveLength(0);

    importSelectedData(exported, ALL_TRANSFER_OPTIONS);

    expect(getTodoLists()).toHaveLength(1);
    expect(getTodoLists()[0].title).toBe("買い物");
    expect(getPresets()).toHaveLength(1);
  });

  it("選んだグループだけが戻り、選ばなかったグループは消えたままになる", () => {
    saveTodoLists([
      { id: "list-1", title: "買い物", items: [] },
    ] as unknown as Parameters<typeof saveTodoLists>[0]);
    savePresets([{ id: "preset-1", name: "朝の支度" }] as unknown as Parameters<
      typeof savePresets
    >[0]);
    const exported = createExportData(ALL_TRANSFER_OPTIONS);
    localStorage.clear();

    importSelectedData(exported, select("todoLists"));

    expect(getTodoLists()).toHaveLength(1);
    expect(getPresets()).toHaveLength(0);
  });
});

describe("getSelectedTypeLabels", () => {
  it("選択したグループのラベルを返す", () => {
    expect(getSelectedTypeLabels(select("routines", "budget"))).toEqual([
      "ルーティン登録データ",
      "家計簿",
    ]);
  });

  it("何も選んでいなければ空を返す", () => {
    expect(getSelectedTypeLabels(EMPTY_TRANSFER_OPTIONS)).toEqual([]);
  });

  it("すべてのグループにラベルが用意されている", () => {
    // 表に足したのにラベルを付け忘れると、確認ダイアログでキー名が出てしまう

    expect(getSelectedTypeLabels(ALL_TRANSFER_OPTIONS)).toHaveLength(
      TRANSFER_GROUPS.length,
    );
  });
});
