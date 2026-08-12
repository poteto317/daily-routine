import {
  DATA_MANAGEMENT_MESSAGES,
  DATA_OPTION_ITEMS,
  getExportButtonViewState,
  getImportButtonViewState,
  getUpdatedTransferOptions,
  hasSelectedOption,
} from "../helpers/dataManagement";
import {
  EMPTY_TRANSFER_OPTIONS,
  type TransferOptions,
} from "../state/constants";
import { TRANSFER_GROUPS } from "../state/dataTransferGroups";

describe("settings data management helpers", () => {
  const someOptions: TransferOptions = {
    ...EMPTY_TRANSFER_OPTIONS,
    routines: true,
  };

  it("選択済み option の有無を判定する", () => {
    expect(hasSelectedOption(EMPTY_TRANSFER_OPTIONS)).toBe(false);
    expect(hasSelectedOption(someOptions)).toBe(true);
  });

  it("export button は選択なしや import success を優先して無効化する", () => {
    expect(
      getExportButtonViewState("idle", "idle", EMPTY_TRANSFER_OPTIONS),
    ).toEqual({
      disabled: true,
      className: "bg-gray-400 text-white cursor-not-allowed",
      label: "💾 選択したデータをエクスポート",
    });

    expect(getExportButtonViewState("success", "idle", someOptions)).toEqual({
      disabled: false,
      className: "bg-green-600 text-white",
      label: "✓ エクスポート完了！",
    });
  });

  it("import button の状態と transfer option 更新を返す", () => {
    expect(getImportButtonViewState("success", someOptions)).toEqual({
      disabled: true,
      className: "bg-green-600 text-white cursor-wait",
      label: "✓ インポート完了！ページをリロード中...",
    });

    expect(
      getUpdatedTransferOptions(EMPTY_TRANSFER_OPTIONS, "settings", true),
    ).toEqual({
      ...EMPTY_TRANSFER_OPTIONS,
      settings: true,
    });
    // 項目はグループ定義表から導く。表に足したのに一覧へ出ない、を防ぐ
    expect(DATA_OPTION_ITEMS).toHaveLength(TRANSFER_GROUPS.length);
    expect(DATA_OPTION_ITEMS.map((item) => item.key)).toEqual(
      TRANSFER_GROUPS.map((group) => group.key),
    );
    expect(DATA_MANAGEMENT_MESSAGES.confirmImport(["設定", "履歴"])).toContain(
      "設定, 履歴",
    );
  });
});
