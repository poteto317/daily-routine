import { normalizeStoredPresets } from "../presetStorageNormalization";

describe("normalizeStoredPresets", () => {
  it("有効なプリセットだけを残し、テンプレートの破損と重複を除去する", () => {
    const result = normalizeStoredPresets([
      null,
      { id: 1, name: "不正", routineTemplates: [] },
      {
        id: "preset-1",
        name: "朝",
        createdAt: "2026-03-07T00:00:00.000Z",
        updatedAt: "2026-03-07T00:00:00.000Z",
        routineTemplates: [
          null,
          { title: 123, startTime: "07:00" },
          {
            title: "朝食",
            startTime: "07:00",
            duration: 30,
            category: "life",
          },
          {
            title: "朝食",
            startTime: "07:00",
            duration: 60,
            category: "life",
          },
          {
            title: "運動",
            startTime: "07:30",
            duration: 20,
            category: "health",
          },
        ],
      },
    ]);

    expect(result).toEqual([
      {
        id: "preset-1",
        name: "朝",
        createdAt: "2026-03-07T00:00:00.000Z",
        updatedAt: "2026-03-07T00:00:00.000Z",
        routineTemplates: [
          {
            title: "朝食",
            startTime: "07:00",
            duration: 30,
            category: "life",
          },
          {
            title: "運動",
            startTime: "07:30",
            duration: 20,
            category: "health",
          },
        ],
      },
    ]);
  });

  it.each([null, {}, "broken", 1])(
    "配列でない保存値 %p は空配列へ正規化する",
    (storedValue) => {
      expect(normalizeStoredPresets(storedValue)).toEqual([]);
    },
  );

  it("テンプレート配列が欠落していてもメタデータが有効なら保持する", () => {
    expect(
      normalizeStoredPresets([
        {
          id: "preset-1",
          name: "朝",
          createdAt: "2026-03-07T00:00:00.000Z",
          updatedAt: "2026-03-07T00:00:00.000Z",
        },
      ]),
    ).toEqual([
      {
        id: "preset-1",
        name: "朝",
        createdAt: "2026-03-07T00:00:00.000Z",
        updatedAt: "2026-03-07T00:00:00.000Z",
        routineTemplates: [],
      },
    ]);
  });

  it.each([
    ["createdAt", undefined],
    ["createdAt", 1],
    ["updatedAt", undefined],
    ["updatedAt", null],
  ] as const)("%s が %p でも有効な日時で補完して保持する", (field, value) => {
    const storedPreset: Record<string, unknown> = {
      id: "preset-1",
      name: "朝",
      description: "朝用",
      createdAt: "2026-03-07T00:00:00.000Z",
      updatedAt: "2026-03-07T00:00:00.000Z",
      routineTemplates: [],
    };
    storedPreset[field] = value;

    expect(normalizeStoredPresets([storedPreset])).toEqual([
      {
        id: "preset-1",
        name: "朝",
        description: "朝用",
        createdAt: "2026-03-07T00:00:00.000Z",
        updatedAt: "2026-03-07T00:00:00.000Z",
        routineTemplates: [],
      },
    ]);
  });

  it("日時が両方欠落した旧プリセットを固定日時で補完して保持する", () => {
    expect(
      normalizeStoredPresets([
        {
          id: "preset-1",
          name: "朝",
          routineTemplates: [],
        },
      ]),
    ).toEqual([
      {
        id: "preset-1",
        name: "朝",
        createdAt: "1970-01-01T00:00:00.000Z",
        updatedAt: "1970-01-01T00:00:00.000Z",
        routineTemplates: [],
      },
    ]);
  });

  it("description が文字列でないプリセットは除外する", () => {
    expect(
      normalizeStoredPresets([
        {
          id: "preset-1",
          name: "朝",
          description: 1,
          routineTemplates: [],
        },
      ]),
    ).toEqual([]);
  });

  it("通知なしを表す notificationMinutes 0 を保持する", () => {
    expect(
      normalizeStoredPresets([
        {
          id: "preset-1",
          name: "朝",
          routineTemplates: [
            {
              title: "朝食",
              startTime: "07:00",
              duration: 30,
              category: "life",
              notificationMinutes: 0,
            },
          ],
        },
      ])[0].routineTemplates,
    ).toEqual([
      {
        title: "朝食",
        startTime: "07:00",
        duration: 30,
        category: "life",
        notificationMinutes: 0,
      },
    ]);
  });
});
