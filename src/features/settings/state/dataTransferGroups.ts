import { hasValidRoutineShape } from "./routineShapeValidation";
import {
  getDailyProgress,
  getMonthlyHistory,
  getRoutines,
  saveDailyProgress,
  saveMonthlyHistory,
  saveRoutines,
} from "@/features/routine/storage";
import { getPresets, savePresets } from "@/features/preset/storage";
import { getSettings, saveSettings } from "@/features/settings/storage";
import { DATA_TRANSFER_ERROR_MESSAGES } from "./errorMessages";
import {
  anyField,
  arrayField,
  objectField,
  type TransferField,
  type TransferPayload,
} from "./transferPayloadRestore";
import {
  BUDGET_TRANSFER_FIELDS,
  collectBudgetTransferData,
} from "./transferGroups/budgetGroup";
import {
  RECORD_TRANSFER_FIELDS,
  collectRecordTransferData,
} from "./transferGroups/recordGroup";
import {
  TODO_LIST_TRANSFER_FIELDS,
  collectTodoListTransferData,
} from "./transferGroups/todoListGroup";
import {
  TRANSFER_GROUP_KEYS,
  type TransferGroupKey,
} from "./transferGroupKeys";

export type { TransferGroupKey, TransferPayload };

export type TransferGroup = {
  key: TransferGroupKey;
  /** チェックボックスと確認ダイアログに出す名前 */
  label: string;
  /** このグループが書き出すデータを集める */
  collect: () => TransferPayload;
  /** payload にこのグループが取り込むものが入っているか */
  hasData: (payload: TransferPayload) => boolean;
  /** payload のうちこのグループが担当する分の形を確かめる */
  validate: (payload: TransferPayload) => void;
  /** payload のうちこのグループが担当する分を保存する */
  restore: (payload: TransferPayload) => void;
};

type TransferGroupDefinition = {
  label: string;
  collect: () => TransferPayload;
  fields: TransferField[];
};

/**
 * 各グループが何を持つか。
 *
 * `Record<TransferGroupKey, ...>` で受けることで、キーを足したのに定義を
 * 書き忘れるとコンパイルエラーになる。
 *
 * JSON のキー名はクラウド同期のペイロードと揃えてある。将来どちらかを
 * 見比べるときに対応が取れるようにするため。
 *
 * 複数のキーを持つグループは別ファイルに置く。同期側も
 * `budgetSyncData.ts` と `todoListSyncData.ts` だけを独立させ、単一キーの
 * ものは `localData.ts` に並べてある。その作りに合わせる。
 *
 * `progress` と `settings` に形の検証を付けないのは、今回の変更より前から
 * 検証していないため。挙動を変えないようそのままにしてある。
 */
const GROUP_DEFINITIONS: Record<TransferGroupKey, TransferGroupDefinition> = {
  routines: {
    label: "ルーティン登録データ",
    collect: () => ({ routines: getRoutines() }),
    fields: [
      arrayField(
        "routines",
        saveRoutines,
        DATA_TRANSFER_ERROR_MESSAGES.invalidRoutinesFormat,
        // 画面が素で参照する項目が欠けた記録を取り込むと、一覧の組み立てで
        // 例外になる。取り込む時点で断る
        { isValidItem: hasValidRoutineShape },
      ),
    ],
  },
  progress: {
    label: "今日の進捗データ",
    // 進捗が無い日は書き出さない。getDailyProgress は記録が無いとき null を
    // 返すが、saveDailyProgress は null を受け取れないため復元できず、
    // 「ファイルに入っているものは戻る」という約束が崩れるため。
    //
    // null を「進捗なし」として復元する案もあるが、取り込み先の端末で
    // その日すでに完了させたルーティンを消してしまう。同期側も同じ理由で
    // dailyProgress の null は尊重せずローカルを維持している
    // （src/features/sync/sync/localData.ts）。
    collect: () => {
      const progress = getDailyProgress();
      return progress === null ? {} : { progress };
    },
    fields: [anyField("progress", saveDailyProgress)],
  },
  history: {
    label: "達成カレンダー・統計データ（全履歴）",
    collect: () => ({ history: getMonthlyHistory() }),
    fields: [
      objectField(
        "history",
        saveMonthlyHistory,
        DATA_TRANSFER_ERROR_MESSAGES.invalidHistoryFormat,
      ),
    ],
  },
  settings: {
    label: "アプリ設定",
    collect: () => ({ settings: getSettings() }),
    fields: [anyField("settings", saveSettings)],
  },
  records: {
    label: "記録（ジャーナル・業務日誌・体重・運動・食事・ポモドーロ・作業）",
    collect: collectRecordTransferData,
    fields: RECORD_TRANSFER_FIELDS,
  },
  todoLists: {
    label: "Todoリスト",
    collect: collectTodoListTransferData,
    fields: TODO_LIST_TRANSFER_FIELDS,
  },
  budget: {
    label: "家計簿",
    collect: collectBudgetTransferData,
    fields: BUDGET_TRANSFER_FIELDS,
  },
  presets: {
    label: "プリセット",
    collect: () => ({ presets: getPresets() }),
    fields: [
      arrayField(
        "presets",
        savePresets,
        DATA_TRANSFER_ERROR_MESSAGES.invalidFieldFormat("presets"),
      ),
    ],
  },
};

/** グループ定義表。並び順はキー一覧が決める */
export const TRANSFER_GROUPS: TransferGroup[] = TRANSFER_GROUP_KEYS.map(
  (key) => {
    const { label, collect, fields } = GROUP_DEFINITIONS[key];
    return {
      key,
      label,
      collect,
      hasData: (payload) => fields.some((field) => field.hasValue(payload)),
      validate: (payload) => fields.forEach((field) => field.validate(payload)),
      restore: (payload) => fields.forEach((field) => field.restore(payload)),
    };
  },
);
