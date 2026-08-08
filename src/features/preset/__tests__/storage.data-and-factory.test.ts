import {
  createPresetFromRoutines,
  createRoutinesFromPreset,
  duplicatePreset,
  getPresets,
  savePresets,
} from "../storage";
import { createPreset, sampleRoutines } from "./storageTestFixtures";

describe("preset storage data/factory", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty array when no presets are saved", () => {
    expect(getPresets()).toEqual([]);
  });

  it("saves and loads presets", () => {
    const presets = [createPreset()];
    savePresets(presets);
    expect(getPresets()).toEqual(presets);
  });

  it("読み込み時にtitle・startTimeが一致する重複テンプレートを排除する", () => {
    // 複数曜日ルーティンを選択して作成された過去のプリセットを想定した
    // 重複テンプレート（同一title・startTime）を保存し、getPresets()で
    // 最初に出現したものだけに正規化されることを検証する。
    const presets = [
      createPreset({
        routineTemplates: [
          { title: "朝食", startTime: "07:00", duration: 30, category: "life" },
          { title: "朝食", startTime: "07:00", duration: 30, category: "life" },
          { title: "運動", startTime: "07:30", duration: 20, category: "health" },
        ],
      }),
    ];
    savePresets(presets);

    const result = getPresets();

    expect(result[0].routineTemplates).toHaveLength(2);
    expect(result[0].routineTemplates.map((t) => t.title)).toEqual([
      "朝食",
      "運動",
    ]);
  });

  it("routineTemplatesが欠落した不正データでも例外を投げず空配列に正規化する", () => {
    // localStorage/同期経由のデータは型検証されないため、旧形式や破損データが
    // 混入しうる。getPresetsは同期のアップロード収集経路(collectLocalSyncData)
    // からも呼ばれるため、ここで例外を投げると同期全体が停止してしまう。
    localStorage.setItem(
      "routine-presets",
      JSON.stringify([{ id: "p1", name: "壊れたプリセット" }]),
    );

    expect(() => getPresets()).not.toThrow();
    expect(getPresets()[0].routineTemplates).toEqual([]);
  });

  it("プリセット配列にnull要素が含まれていても例外を投げず除外する", () => {
    localStorage.setItem(
      "routine-presets",
      JSON.stringify([null, { id: "p1", name: "正常", routineTemplates: [] }]),
    );

    expect(() => getPresets()).not.toThrow();
    expect(getPresets()).toHaveLength(1);
    expect(getPresets()[0].id).toBe("p1");
  });

  it("テンプレート配列にnull要素が含まれていても例外を投げず除外する", () => {
    localStorage.setItem(
      "routine-presets",
      JSON.stringify([
        {
          id: "p1",
          name: "壊れたテンプレート入り",
          routineTemplates: [
            null,
            { title: "朝食", startTime: "07:00", duration: 30, category: "life" },
          ],
        },
      ]),
    );

    expect(() => getPresets()).not.toThrow();
    expect(getPresets()[0].routineTemplates).toHaveLength(1);
    expect(getPresets()[0].routineTemplates[0].title).toBe("朝食");
  });

  it("title・startTimeが文字列でないテンプレートは除外する", () => {
    // レビュー指摘: null以外の不正要素（title/startTime欠落や別の型）は
    // truthyチェックだけでは弾けず、そのままroutineTemplatesに混入し得た。
    localStorage.setItem(
      "routine-presets",
      JSON.stringify([
        {
          id: "p1",
          name: "不正テンプレート混在",
          routineTemplates: [
            { title: 123, startTime: "07:00", duration: 30, category: "life" },
            { title: "朝食", startTime: null, duration: 30, category: "life" },
            { startTime: "07:00", duration: 30, category: "life" },
            { title: "運動", startTime: "07:30", duration: 20, category: "health" },
          ],
        },
      ]),
    );

    const result = getPresets();

    expect(result[0].routineTemplates).toHaveLength(1);
    expect(result[0].routineTemplates[0].title).toBe("運動");
  });

  it("id・nameが文字列でないプリセットは除外する", () => {
    localStorage.setItem(
      "routine-presets",
      JSON.stringify([
        { id: 1, name: "IDが数値", routineTemplates: [] },
        { id: "p2", name: null, routineTemplates: [] },
        { name: "IDが欠落", routineTemplates: [] },
        { id: "p4", name: "正常", routineTemplates: [] },
      ]),
    );

    const result = getPresets();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("p4");
  });

  it("保存値が配列でない不正データなら空配列を返す", () => {
    localStorage.setItem("routine-presets", JSON.stringify({ broken: true }));

    expect(getPresets()).toEqual([]);
  });

  it("重複がなければテンプレートをそのまま返す", () => {
    const presets = [
      createPreset({
        routineTemplates: [
          { title: "朝食", startTime: "07:00", duration: 30, category: "life" },
          { title: "朝食", startTime: "08:00", duration: 30, category: "life" },
        ],
      }),
    ];
    savePresets(presets);

    expect(getPresets()[0].routineTemplates).toHaveLength(2);
  });

  it("creates a preset from routines", () => {
    const preset = createPresetFromRoutines(
      "モーニング",
      sampleRoutines,
      "朝のルーティン",
    );
    expect(preset.name).toBe("モーニング");
    expect(preset.description).toBe("朝のルーティン");
    expect(preset.routineTemplates).toHaveLength(1);
    expect(preset.routineTemplates[0].title).toBe("朝食");
    expect(preset.routineTemplates[0]).not.toHaveProperty("daysOfWeek");
  });

  it("creates routines from preset and target days", () => {
    const preset = createPreset({
      routineTemplates: [
        { title: "朝食", startTime: "07:00", duration: 30, category: "life" },
        { title: "運動", startTime: "07:30", duration: 20, category: "health" },
      ],
    });

    const routines = createRoutinesFromPreset(preset, [1, 2, 3]);
    expect(routines).toHaveLength(2);
    expect(routines[0].title).toBe("朝食");
    expect(routines[0].daysOfWeek).toEqual([1, 2, 3]);
    expect(routines[0].isCompleted).toBe(false);
    expect(routines[1].title).toBe("運動");
  });

  it("プリセットを複製し、新しいidと「のコピー」を付けた名前を発行する", () => {
    const preset = createPreset({
      id: "preset1",
      name: "朝ルーティン",
      description: "朝の準備",
      routineTemplates: [
        { title: "朝食", startTime: "07:00", duration: 30, category: "life" },
      ],
    });

    const duplicated = duplicatePreset(preset);

    expect(duplicated.id).not.toBe(preset.id);
    expect(duplicated.name).toBe("朝ルーティンのコピー");
    expect(duplicated.description).toBe("朝の準備");
    expect(duplicated.routineTemplates).toEqual(preset.routineTemplates);
  });

  it("複製後にroutineTemplates配列を書き換えても元プリセットに影響しない", () => {
    const preset = createPreset({
      routineTemplates: [
        { title: "朝食", startTime: "07:00", duration: 30, category: "life" },
      ],
    });

    const duplicated = duplicatePreset(preset);
    duplicated.routineTemplates.push({
      title: "追加された項目",
      startTime: "12:00",
      duration: 10,
      category: "life",
    });
    duplicated.routineTemplates[0].title = "書き換えられたタイトル";

    expect(preset.routineTemplates).toHaveLength(1);
    expect(preset.routineTemplates[0].title).toBe("朝食");
  });

  it("複製のcreatedAt/updatedAtは元プリセットの値を引き継がない", () => {
    const preset = createPreset({
      createdAt: "2020-01-01T00:00:00.000Z",
      updatedAt: "2020-01-01T00:00:00.000Z",
    });

    const duplicated = duplicatePreset(preset);

    expect(duplicated.createdAt).not.toBe(preset.createdAt);
    expect(duplicated.updatedAt).not.toBe(preset.updatedAt);
  });
});
