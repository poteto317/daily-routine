import { buildDynamicTodoMenuItems } from "@/hooks/dynamicTodoMenuItems";
import { orderHeaderMenuItems, sortByMenuOrder } from "@/hooks/headerMenuOrder";
import type { HeaderMenuItem } from "@/hooks/headerMenuItemTypes";
import { filterStaticHeaderMenuItems } from "@/hooks/staticHeaderMenuItems";

const baseVisibleFeatures = {
  journal: true,
  calendar: true,
  statistics: true,
  pomodoro: true,
  worktracker: true,
  weightTracker: true,
  workoutTracker: true,
  meal: true,
  budget: true,
  weather: true,
  preset: true,
  todoLists: true,
  syncManagement: true,
  testMatrix: true,
  accountAdmin: true,
};

describe("headerMenuItemHelpers", () => {
  it("メニュー未展開または Todo 非表示なら動的 Todo 項目を作らない", () => {
    const setSelectedTodoListId = jest.fn();

    expect(
      buildDynamicTodoMenuItems({
        isMenuOpen: false,
        todoListsVisible: true,
        todoLists: [],
        currentSelectedId: null,
        setSelectedTodoListId,
      }),
    ).toEqual([]);

    expect(
      buildDynamicTodoMenuItems({
        isMenuOpen: true,
        todoListsVisible: false,
        todoLists: [],
        currentSelectedId: null,
        setSelectedTodoListId,
      }),
    ).toEqual([]);
  });

  it("動的 Todo 項目は hidden を除外し、選択状態と遷移前処理を持つ", () => {
    const setSelectedTodoListId = jest.fn();
    const items = buildDynamicTodoMenuItems({
      isMenuOpen: true,
      todoListsVisible: true,
      todoLists: [
        {
          id: "list-1",
          title: "買い物",
          items: [],
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "list-2",
          title: "非表示",
          items: [],
          createdAt: "2026-01-02T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z",
          isHidden: true,
        },
      ],
      currentSelectedId: "list-1",
      setSelectedTodoListId,
    });

    expect(items).toHaveLength(1);
    expect(items[0]).toEqual(
      expect.objectContaining({
        id: "todo-list-list-1",
        label: "買い物",
        isActive: true,
        route: "todo-lists",
      }),
    );

    items[0].onBeforeNavigate?.();
    expect(setSelectedTodoListId).toHaveBeenCalledWith("list-1");
  });

  it("静的メニューは feature 設定と管理者状態で絞り込む", () => {
    const items = filterStaticHeaderMenuItems({
      visibleFeatures: {
        ...baseVisibleFeatures,
        weather: false,
        accountAdmin: false,
      },
      isAdmin: true,
      isPageType: (route): route is HeaderMenuItem["route"] =>
        route !== "invalid",
    });

    expect(items.some((item) => item.id === "weather")).toBe(false);
    expect(items.some((item) => item.id === "account-admin")).toBe(false);
    expect(items.some((item) => item.id === "settings")).toBe(true);
  });

  it("運動記録は feature 設定で表示/非表示を切り替えられる", () => {
    const isPageType = (route: string): route is HeaderMenuItem["route"] =>
      route !== "invalid";

    const visibleItems = filterStaticHeaderMenuItems({
      visibleFeatures: baseVisibleFeatures,
      isAdmin: false,
      isPageType,
    });
    expect(visibleItems.some((item) => item.id === "workout-tracker")).toBe(
      true,
    );

    const hiddenItems = filterStaticHeaderMenuItems({
      visibleFeatures: { ...baseVisibleFeatures, workoutTracker: false },
      isAdmin: false,
      isPageType,
    });
    expect(hiddenItems.some((item) => item.id === "workout-tracker")).toBe(
      false,
    );
  });

  it("test-matrix は管理者のみ表示される", () => {
    const isPageType = (route: string): route is HeaderMenuItem["route"] =>
      route !== "invalid";

    const adminItems = filterStaticHeaderMenuItems({
      visibleFeatures: baseVisibleFeatures,
      isAdmin: true,
      isPageType,
    });
    expect(adminItems.some((item) => item.id === "test-matrix")).toBe(true);

    const nonAdminItems = filterStaticHeaderMenuItems({
      visibleFeatures: baseVisibleFeatures,
      isAdmin: false,
      isPageType,
    });
    expect(nonAdminItems.some((item) => item.id === "test-matrix")).toBe(false);
  });

  it("test-matrix は visibleFeatures が undefined でも非管理者には表示されない", () => {
    const nonAdminItems = filterStaticHeaderMenuItems({
      visibleFeatures: undefined,
      isAdmin: false,
      isPageType: (route): route is HeaderMenuItem["route"] =>
        route !== "invalid",
    });
    expect(nonAdminItems.some((item) => item.id === "test-matrix")).toBe(false);
  });

  it("不具合報告は feature 設定に関わらず常に表示される", () => {
    const isPageType = (route: string): route is HeaderMenuItem["route"] =>
      route !== "invalid";

    const items = filterStaticHeaderMenuItems({
      visibleFeatures: baseVisibleFeatures,
      isAdmin: false,
      isPageType,
    });
    expect(items.some((item) => item.id === "bug-report")).toBe(true);

    const itemsWithoutVisibleFeatures = filterStaticHeaderMenuItems({
      visibleFeatures: undefined,
      isAdmin: false,
      isPageType,
    });
    expect(
      itemsWithoutVisibleFeatures.some((item) => item.id === "bug-report"),
    ).toBe(true);
  });

  it("常時表示対象（home/settings/bug-report）はvisibleFeaturesの内容に関わらずすべて表示される", () => {
    const isPageType = (route: string): route is HeaderMenuItem["route"] =>
      route !== "invalid";

    const items = filterStaticHeaderMenuItems({
      visibleFeatures: baseVisibleFeatures,
      isAdmin: false,
      isPageType,
    });

    expect(items.some((item) => item.id === "home")).toBe(true);
    expect(items.some((item) => item.id === "settings")).toBe(true);
    expect(items.some((item) => item.id === "bug-report")).toBe(true);
  });

  it("並び替えで home を先頭、settings を末尾、legacy todo-lists 順序を維持する", () => {
    const staticItems: HeaderMenuItem[] = [
      { id: "home", label: "Home", icon: "🏠", route: "home" },
      { id: "journal", label: "Journal", icon: "📔", route: "journal" },
      { id: "weather", label: "Weather", icon: "☀️", route: "weather" },
      { id: "settings", label: "Settings", icon: "⚙️", route: "settings" },
    ];
    const dynamicItems: HeaderMenuItem[] = [
      {
        id: "todo-list-list-1",
        label: "買い物",
        icon: "✅",
        route: "todo-lists",
      },
      {
        id: "todo-list-list-2",
        label: "仕事",
        icon: "✅",
        route: "todo-lists",
      },
    ];

    const ordered = orderHeaderMenuItems({
      staticItems,
      dynamicItems,
      menuOrder: ["journal", "todo-lists", "weather"],
    }).map((item) => item.id);

    expect(ordered[0]).toBe("home");
    expect(ordered.indexOf("journal")).toBeLessThan(
      ordered.indexOf("todo-list-list-1"),
    );
    expect(ordered.indexOf("todo-list-list-2")).toBeLessThan(
      ordered.indexOf("weather"),
    );
    expect(ordered[ordered.length - 1]).toBe("settings");
  });

  it("静的メニュー項目「Todoリスト管理」(todo-list-management)は個別のTodoリスト項目と誤って同一視されない", () => {
    // "todo-list-management" は "todo-list-" で前方一致するが、個別の
    // Todoリスト項目（"todo-list-<id>"）ではなく静的メニュー項目自身のID。
    // 誤って同一視されると、menuOrder上の"todo-lists"レガシープレースホルダー
    // 位置＋小数のランクが割り当てられ、本来configの並び順で
    // "todo-list-management"より前に来るはずの他の項目（weather）より
    // 前に出てきてしまう。
    const staticItems: HeaderMenuItem[] = [
      { id: "home", label: "Home", icon: "🏠", route: "home" },
      { id: "weather", label: "Weather", icon: "☀️", route: "weather" },
      {
        id: "todo-list-management",
        label: "Todoリスト管理",
        icon: "📝",
        route: "todo-list-management",
      },
      { id: "settings", label: "Settings", icon: "⚙️", route: "settings" },
    ];
    const dynamicItems: HeaderMenuItem[] = [
      {
        id: "todo-list-list-1",
        label: "買い物",
        icon: "✅",
        route: "todo-lists",
      },
      {
        id: "todo-list-list-2",
        label: "仕事",
        icon: "✅",
        route: "todo-lists",
      },
    ];

    // menuOrderにはレガシーの"todo-lists"プレースホルダーのみを含み、
    // "weather"・"todo-list-management"のどちらも明示的には含まれていない
    // （＝設定画面で並び替えたことが一度もない状態）。
    const ordered = orderHeaderMenuItems({
      staticItems,
      dynamicItems,
      menuOrder: ["todo-lists"],
    }).map((item) => item.id);

    // config上ではweatherがtodo-list-managementより前にあるため、
    // どちらもmenuOrderに未設定なら自然順（config順）が保たれ、
    // weatherが先に来るはず。
    expect(ordered.indexOf("weather")).toBeLessThan(
      ordered.indexOf("todo-list-management"),
    );
  });

  it("実在の静的メニュー項目でない「todo-list-」プレフィックスidは、引き続き個別のTodoリスト項目として扱われる（除外のしすぎを防ぐ）", () => {
    // isTodoListMenuItemIdはmenuConfig.menuItemsに実在する静的idだけを
    // 除外する。テストで使う簡略化されたTodoリストの動的項目id
    // （"todo-list-list-1"等）はmenuConfigには存在しないため、
    // 個別のTodoリスト項目として正しく扱われ続けるはず
    // （前段の「並び替えで home を先頭...」テストで暗黙に確認しているが、
    // ここでは除外条件のしすぎ（過剰除外）がないことを明示的に検証する）。
    const dynamicItems: HeaderMenuItem[] = [
      {
        id: "todo-list-list-1",
        label: "買い物",
        icon: "✅",
        route: "todo-lists",
      },
      {
        id: "todo-list-list-2",
        label: "仕事",
        icon: "✅",
        route: "todo-lists",
      },
    ];

    // menuOrderにレガシーの"todo-lists"プレースホルダーのみを含む状態で、
    // 個別のTodoリスト項目同士が正しくクラスタリングされる
    // （＝isTodoListMenuItemIdがtrueを返し続けている）ことを確認する。
    const ordered = orderHeaderMenuItems({
      staticItems: [
        { id: "home", label: "Home", icon: "🏠", route: "home" },
        { id: "settings", label: "Settings", icon: "⚙️", route: "settings" },
      ],
      dynamicItems,
      menuOrder: ["todo-lists"],
    }).map((item) => item.id);

    expect(ordered.indexOf("todo-list-list-1")).toBeLessThan(
      ordered.indexOf("todo-list-list-2"),
    );
  });
});

describe("sortByMenuOrder", () => {
  type Item = { id: string; label: string };
  const item = (id: string): Item => ({ id, label: id });

  it("menuOrderが空のとき、naturalOrderIdsの順序を保つ", () => {
    const items = [item("a"), item("b"), item("c")];

    const result = sortByMenuOrder(items, (i) => i.id, ["a", "b", "c"], []);

    expect(result.map((i) => i.id)).toEqual(["a", "b", "c"]);
  });

  it("menuOrderに明示エントリがあれば、その順序が優先される", () => {
    const items = [item("a"), item("b"), item("c")];

    const result = sortByMenuOrder(
      items,
      (i) => i.id,
      ["a", "b", "c"],
      ["c", "a", "b"],
    );

    expect(result.map((i) => i.id)).toEqual(["c", "a", "b"]);
  });

  it("menuOrderに存在しない項目は末尾に自然順で追加される", () => {
    const items = [item("a"), item("b"), item("c")];

    const result = sortByMenuOrder(items, (i) => i.id, ["a", "b", "c"], ["b"]);

    expect(result.map((i) => i.id)).toEqual(["b", "a", "c"]);
  });

  it("空配列を渡すと空配列を返す", () => {
    expect(sortByMenuOrder([], (i: Item) => i.id, [], [])).toEqual([]);
  });

  it("元のitems配列を変更しない（イミュータブル）", () => {
    const items = [item("a"), item("b"), item("c")];
    const copy = [...items];

    sortByMenuOrder(items, (i) => i.id, ["a", "b", "c"], ["c", "a"]);

    expect(items).toEqual(copy);
  });

  it("各itemのランク計算はitems件数分だけ行われ、sort()の比較回数分は呼ばれない（O(n log n)回の線形探索を避ける）", () => {
    // 各itemのランク（内部でmenuOrder.indexOfという線形探索を伴う）を
    // sort()のコンパレータ内で都度計算すると、比較回数（O(n log n)）分
    // 呼ばれてしまう。ソート前に1回だけ計算してから比較するように
    // なっていれば、getIdの呼び出し回数はちょうどitems.lengthになるはず。
    const items = Array.from({ length: 50 }, (_, i) => item(`item-${i}`));
    const naturalOrderIds = items.map((i) => i.id);
    const menuOrder = [...naturalOrderIds].reverse();
    const getId = jest.fn((i: Item) => i.id);

    const result = sortByMenuOrder(items, getId, naturalOrderIds, menuOrder);

    expect(getId).toHaveBeenCalledTimes(items.length);
    expect(result.map((i) => i.id)).toEqual(menuOrder);
  });
});

describe("sortByMenuOrder（menuOrder に載っていない Todoリストの位置）", () => {
  const sortIds = (naturalOrderIds: string[], menuOrder: string[]) =>
    sortByMenuOrder(naturalOrderIds, (id) => id, naturalOrderIds, menuOrder);

  it("リストの ID が載っていれば、載っていないリストは最後に載っているリストの直後に出る", () => {
    expect(
      sortIds(
        ["journal", "todo-list-a", "todo-list-b", "todo-list-c", "bug-report"],
        ["todo-list-a", "todo-list-b", "journal", "bug-report"],
      ),
    ).toEqual([
      "todo-list-a",
      "todo-list-b",
      "todo-list-c",
      "journal",
      "bug-report",
    ]);
  });

  it("載っていないリストが複数あれば、最後に載っているリストの直後に自然順で並ぶ", () => {
    expect(
      sortIds(
        ["todo-list-a", "todo-list-b", "todo-list-c", "todo-list-d", "journal"],
        ["todo-list-a", "todo-list-b", "journal"],
      ),
    ).toEqual([
      "todo-list-a",
      "todo-list-b",
      "todo-list-c",
      "todo-list-d",
      "journal",
    ]);
  });

  it("基準は最初ではなく最後に載っているリストである", () => {
    expect(
      sortIds(
        ["journal", "budget", "todo-list-a", "todo-list-b", "todo-list-c"],
        ["todo-list-a", "journal", "todo-list-b", "budget"],
      ),
    ).toEqual([
      "todo-list-a",
      "journal",
      "todo-list-b",
      "todo-list-c",
      "budget",
    ]);
  });

  it("旧来の todo-lists があれば、リストの ID が載っていても今までどおり todo-lists の直後に出る", () => {
    expect(
      sortIds(
        ["journal", "todo-list-a", "todo-list-b", "todo-list-c"],
        ["todo-list-a", "todo-lists", "journal", "todo-list-b"],
      ),
    ).toEqual(["todo-list-a", "todo-list-c", "journal", "todo-list-b"]);
  });

  it("menuOrder が空なら今までどおり自然順", () => {
    expect(
      sortIds(["journal", "todo-list-a", "todo-list-b", "bug-report"], []),
    ).toEqual(["journal", "todo-list-a", "todo-list-b", "bug-report"]);
  });

  it("リストの ID が 1 つも載っていなければ、載っていないリストは今までどおり末尾に出る", () => {
    expect(
      sortIds(
        ["todo-list-a", "journal", "bug-report"],
        ["bug-report", "journal"],
      ),
    ).toEqual(["bug-report", "journal", "todo-list-a"]);
  });

  it("リスト以外の載っていない項目は今までどおり末尾に自然順で出る", () => {
    expect(
      sortIds(
        ["todo-list-a", "future-feature", "journal", "todo-list-b"],
        ["todo-list-a", "journal"],
      ),
    ).toEqual(["todo-list-a", "todo-list-b", "journal", "future-feature"]);
  });

  it("ハンバーガーメニューでも、載っていないリストは他のリストの直後で、設定より前に出る", () => {
    const staticItems: HeaderMenuItem[] = [
      { id: "home", label: "ホーム", icon: "🏠", route: "home" },
      { id: "journal", label: "ジャーナル", icon: "📔", route: "journal" },
      {
        id: "bug-report",
        label: "不具合を報告",
        icon: "📣",
        route: "bug-report",
      },
      { id: "settings", label: "設定", icon: "⚙️", route: "settings" },
    ];
    const dynamicItems: HeaderMenuItem[] = ["a", "b", "c"].map((id) => ({
      id: `todo-list-${id}`,
      label: id,
      icon: "✅",
      route: "todo-lists" as const,
    }));

    const ordered = orderHeaderMenuItems({
      staticItems,
      dynamicItems,
      menuOrder: ["todo-list-a", "todo-list-b", "journal", "bug-report"],
    }).map((item) => item.id);

    expect(ordered).toEqual([
      "home",
      "todo-list-a",
      "todo-list-b",
      "todo-list-c",
      "journal",
      "bug-report",
      "settings",
    ]);
  });
});
