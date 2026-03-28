import type { DetailTestCaseMap } from "./types";

export const DETAILED_TEST_CASES_GROUP_14_18: DetailTestCaseMap = {
  "14-1": [
    {
      "id": "14-1-1",
      "scenario": "通知設定付きルーティンがある場合",
      "expected": "通知スケジュールが生成される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "14-1-2",
      "scenario": "通知設定なし（空白）のルーティン",
      "expected": "通知スケジュールに含まれない",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "14-2": [
    {
      "id": "14-2-1",
      "scenario": "月曜のルーティンの通知",
      "expected": "月曜にのみ通知がスケジュールされる",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "14-2-2",
      "scenario": "全曜日のルーティンの通知",
      "expected": "毎日通知がスケジュールされる",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "14-3": [
    {
      "id": "14-3-1",
      "scenario": "祝日モード「除外」の通知、当日が祝日",
      "expected": "通知が送信されない",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "14-3-2",
      "scenario": "祝日モード「祝日のみ」の通知、当日が祝日",
      "expected": "通知が送信される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "14-3-3",
      "scenario": "祝日モード「祝日のみ」の通知、当日が平日",
      "expected": "通知が送信されない",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "14-4": [
    {
      "id": "14-4-1",
      "scenario": "Service Workerが登録されている状態",
      "expected": "SW経由で通知が配信される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "14-5": [
    {
      "id": "14-5-1",
      "scenario": "スケジュールクリアを実行",
      "expected": "全ての予定通知がクリアされる",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "14-6": [
    {
      "id": "14-6-1",
      "scenario": "通知権限が「許可」の場合",
      "expected": "通知が正常に動作する",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "14-6-2",
      "scenario": "通知権限が「拒否」の場合",
      "expected": "通知なし、エラーなし",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "14-6-3",
      "scenario": "通知権限が「デフォルト」の場合",
      "expected": "許可を求めるプロンプトが表示される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "15-1": [
    {
      "id": "15-1-1",
      "scenario": "ルーティン＋履歴＋設定をアップロード",
      "expected": "Firestoreのユーザードキュメントに保存",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "15-1-2",
      "scenario": "アップロード中のステータス",
      "expected": "「同期中」表示",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "15-2": [
    {
      "id": "15-2-1",
      "scenario": "Firestoreからデータをダウンロード",
      "expected": "ローカルデータが上書きされる",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "15-2-2",
      "scenario": "ダウンロード後のページ状態",
      "expected": "自動リロードで反映",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "15-3": [
    {
      "id": "15-3-1",
      "scenario": "初回同期を実行",
      "expected": "ローカル/リモートどちらを使うか自動判定",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "15-4": [
    {
      "id": "15-4-1",
      "scenario": "他デバイスからFirestoreが更新された場合",
      "expected": "onSnapshotで変更が検知される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "15-4-2",
      "scenario": "変更検知時の通知",
      "expected": "リモート変更通知が表示される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "15-5": [
    {
      "id": "15-5-1",
      "scenario": "デバイスIDが未設定の場合",
      "expected": "自動生成され保存される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "15-5-2",
      "scenario": "デバイスIDが既存の場合",
      "expected": "既存IDが再利用される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "15-6": [
    {
      "id": "15-6-1",
      "scenario": "同期後のステータス更新",
      "expected": "lastSyncTimeが更新される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "15-6-2",
      "scenario": "同期エラー時のステータス",
      "expected": "errorフィールドにメッセージが設定される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "15-7": [
    {
      "id": "15-7-1",
      "scenario": "リモートデータ変更検知時",
      "expected": "ユーザーに通知バナーが表示される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "16-1": [
    {
      "id": "16-1-1",
      "scenario": "ハンバーガーメニューアイコンをクリック",
      "expected": "サイドメニューが開く",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "16-1-2",
      "scenario": "メニュー内のページリンクをクリック",
      "expected": "該当ページに遷移、メニューが閉じる",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "16-1-3",
      "scenario": "メニュー内のログアウトボタン",
      "expected": "ログアウトされ、ログイン画面に遷移",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "16-1-4",
      "scenario": "メニュー内のユーザー情報表示",
      "expected": "ログイン中のユーザー情報が表示",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "16-2": [
    {
      "id": "16-2-1",
      "scenario": "編集モードボタンをクリック",
      "expected": "編集モードに切り替わり、アイコンが変化",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "16-2-2",
      "scenario": "閲覧モードボタンをクリック",
      "expected": "閲覧モードに切り替わり、アイコンが変化",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "16-3": [
    {
      "id": "16-3-1",
      "scenario": "設定で機能を非表示にした場合",
      "expected": "メニューから該当項目が消える",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "16-3-2",
      "scenario": "設定で機能を再表示にした場合",
      "expected": "メニューに該当項目が復帰する",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "16-4": [
    {
      "id": "16-4-1",
      "scenario": "プログレスバーの表示を確認",
      "expected": "今日の進捗率が視覚的に表示される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "16-5": [
    {
      "id": "16-5-1",
      "scenario": "電車遅延が検知された場合",
      "expected": "遅延通知バナーが表示される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "16-5-2",
      "scenario": "電車遅延が解消された場合",
      "expected": "バナーが非表示になる",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "16-6": [
    {
      "id": "16-6-1",
      "scenario": "ライトテーマの全画面確認",
      "expected": "全ページが明るい配色で表示",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "16-6-2",
      "scenario": "ダークテーマの全画面確認",
      "expected": "全ページが暗い配色で表示",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "16-6-3",
      "scenario": "テーマ切替時のちらつき確認",
      "expected": "画面遷移時にちらつきがない",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "16-7": [
    {
      "id": "16-7-1",
      "scenario": "PWAインストールプロンプト表示",
      "expected": "条件を満たした場合にインストール促進表示",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "16-7-2",
      "scenario": "Service Workerが登録されていること",
      "expected": "ブラウザDevToolsで登録確認",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "16-8": [
    {
      "id": "16-8-1",
      "scenario": "サブページからブラウザの戻るボタン",
      "expected": "前のページに正常に戻る",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "16-8-2",
      "scenario": "ホームでブラウザの戻るボタン",
      "expected": "ブラウザのデフォルト挙動（またはなし）",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "17-1": [
    {
      "id": "17-1-1",
      "scenario": "初回アクセス時のSW登録",
      "expected": "Service Workerが正常に登録される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "17-1-2",
      "scenario": "SW更新がある場合",
      "expected": "新しいSWが自動的にアクティベートされる",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "17-2": [
    {
      "id": "17-2-1",
      "scenario": "オフライン時にアプリにアクセス",
      "expected": "キャッシュからページが表示される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "17-2-2",
      "scenario": "オフライン時のデータ操作",
      "expected": "ローカルストレージで正常に動作",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "17-3": [
    {
      "id": "17-3-1",
      "scenario": "通知スケジューラの動作確認",
      "expected": "1分間隔で通知チェックが実行される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "17-3-2",
      "scenario": "通知時刻になった場合",
      "expected": "ルーティン通知が表示される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "17-4": [
    {
      "id": "17-4-1",
      "scenario": "SW経由でテスト通知を送信",
      "expected": "正常に通知が表示される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "18-1": [
    {
      "id": "18-1-1",
      "scenario": "Firebase設定あり（.env.local）で初期化",
      "expected": "Auth/Firestore/FCMが利用可能",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "18-1-2",
      "scenario": "Firebase設定なし（.env.local未設定）で初期化",
      "expected": "エラーにならず、機能が制限される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "18-2": [
    {
      "id": "18-2-1",
      "scenario": "FCMトークン取得",
      "expected": "トークンが正常に取得される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "18-2-2",
      "scenario": "通知未許可時のFCMトークン取得",
      "expected": "エラーなく処理される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "18-3": [
    {
      "id": "18-3-1",
      "scenario": "元日（1月1日）の祝日判定",
      "expected": "trueが返る",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "18-3-2",
      "scenario": "通常の平日の祝日判定",
      "expected": "falseが返る",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "18-3-3",
      "scenario": "振替休日の判定",
      "expected": "trueが返る",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "18-4": [
    {
      "id": "18-4-1",
      "scenario": "getStorageItemでデータ取得",
      "expected": "JSON.parseされた値が返る",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "18-4-2",
      "scenario": "存在しないキーで取得",
      "expected": "デフォルト値が返る",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "18-4-3",
      "scenario": "setStorageItemでデータ保存",
      "expected": "JSON.stringifyされて保存",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "18-4-4",
      "scenario": "ログイン中のユーザースコープ確認",
      "expected": "user:{uid}:{key}形式のキーで保存される",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ],
  "18-5": [
    {
      "id": "18-5-1",
      "scenario": "timeToMinutes('14:30')",
      "expected": "870が返る",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "18-5-2",
      "scenario": "minutesToTime(870)",
      "expected": "'14:30'が返る",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    },
    {
      "id": "18-5-3",
      "scenario": "formatDuration(90)",
      "expected": "'1時間30分'が返る",
      "pc": "unchecked",
      "sp": "unchecked",
      "note": ""
    }
  ]
};
