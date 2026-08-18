// This file is a template. `npm run generate:fcm-sw` injects environment values
// into public/firebase-messaging-sw.js before dev/build/start.

// Firebase SDK をインポート
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: __NEXT_PUBLIC_FIREBASE_API_KEY__,
  authDomain: __NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN__,
  projectId: __NEXT_PUBLIC_FIREBASE_PROJECT_ID__,
  storageBucket: __NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET__,
  messagingSenderId: __NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID__,
  appId: __NEXT_PUBLIC_FIREBASE_APP_ID__,
};

const hasFirebaseMessagingConfig = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value.length > 0,
);

let messaging = null;

if (hasFirebaseMessagingConfig) {
  firebase.initializeApp(firebaseConfig);
  messaging = firebase.messaging();

  // バックグラウンドでプッシュ通知を受信（FCM経由）
  messaging.onBackgroundMessage((payload) => {
    const notificationTitle =
      payload.notification?.title || "ルーティンのリマインダー";
    const notificationOptions = {
      body: payload.notification?.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: payload.data?.routineId || "routine-notification",
      requireInteraction: false,
      vibrate: [200, 100, 200],
    };

    return self.registration.showNotification(
      notificationTitle,
      notificationOptions,
    );
  });
} else {
  self.addEventListener("install", () => {
    console.info(
      "[FCM SW] Firebase messaging config is not set; FCM is disabled.",
    );
  });
}

// ============================================
// ローカル通知スケジュール機能（フォールバック用）
// ============================================

// 通知スケジュールを保持するMap
const notificationSchedules = new Map();
let checkInterval = null;

// クライアントにログを送信するヘルパー関数
const logToClient = (message) => {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "SW_LOG",
        message: message,
      });
    });
  });
};

// メッセージリスナー：メインスレッドからスケジュールを受信
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SCHEDULE_NOTIFICATIONS") {
    const { schedules } = event.data;

    // 既存のスケジュールをクリア
    notificationSchedules.clear();

    // 新しいスケジュールを登録
    schedules.forEach((schedule) => {
      notificationSchedules.set(schedule.id, schedule);
    });

    logToClient(`[FCM SW] Schedules updated: ${notificationSchedules.size}`);

    // チェック間隔を開始
    startNotificationCheck();

    // 確認応答
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ success: true, count: schedules.length });
    }
  } else if (event.data && event.data.type === "CLEAR_SCHEDULES") {
    notificationSchedules.clear();
    stopNotificationCheck();

    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ success: true });
    }
  }
});

// 通知チェックを開始
const startNotificationCheck = () => {
  if (checkInterval) {
    clearInterval(checkInterval);
  }

  logToClient("[FCM SW] Starting notification check");

  // 1分ごとにチェック
  checkInterval = setInterval(() => {
    checkAndSendNotifications();
  }, 60000);

  // 即座に1回チェック
  checkAndSendNotifications();
};

// 通知チェックを停止
const stopNotificationCheck = () => {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
    logToClient("[FCM SW] Notification check stopped");
  }
};

// JST の日付処理は src/service-worker/custom-sw/jstDate.js を唯一の実装とし、
// 生成時にここへ差し込む。テンプレートに書き写すと、片方だけ直したときに
// custom SW と通知の重複防止キーが食い違う。
__JST_DATE_HELPERS__;

// 現在時刻をチェックして通知を送信
const checkAndSendNotifications = async () => {
  const now = new Date();
  // 本体の記録と同じ JST 基準にする。UTC や端末ローカルのままだと、
  // 日本時間の 0〜9 時に通知の日付と曜日が前日のものになる。
  const today = toJstDateKey(now);
  const currentDayOfWeek = toJstDay(now);
  const isWeekend = currentDayOfWeek === 0 || currentDayOfWeek === 6;

  logToClient(
    `[FCM SW] Checking notifications: ${now.toLocaleTimeString("ja-JP")} dayOfWeek:${currentDayOfWeek} schedules:${notificationSchedules.size}`,
  );

  for (const [id, schedule] of notificationSchedules) {
    // 曜日チェック
    if (
      schedule.dayOfWeek !== undefined &&
      schedule.dayOfWeek !== currentDayOfWeek
    ) {
      continue;
    }

    // 祝日スケジュールの場合、土日以外はスキップ
    if (schedule.isHoliday && !isWeekend) {
      continue;
    }

    // ルーティンIDを抽出（スケジュールIDからサフィックスを除去）
    const routineId = id.replace(/-\d+$/, "").replace(/-holiday$/, "");

    // 既に今日このルーティンで通知済みかチェック（ルーティン単位で重複防止）
    const notifiedKey = `notified_${routineId}_${today}`;
    const alreadyNotified = await getCacheValue(notifiedKey);

    if (alreadyNotified) {
      continue;
    }

    // 通知時刻（開始時刻 + 指定分数後）と今の差。日付キーや曜日と同じ JST 基準
    const timeDiff = diffFromJstScheduleMs(
      now,
      schedule.time,
      schedule.minutesAfter || 0,
    );

    // 通知時刻が現在時刻と一致する（±90秒の誤差を許容）
    if (timeDiff < 90000) {
      logToClient(`[FCM SW] Sending notification: ${schedule.title}`);

      try {
        await self.registration.showNotification(schedule.title, {
          body: schedule.body,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag: routineId,
          requireInteraction: false,
          silent: false,
          vibrate: [200, 100, 200],
        });

        // 今日通知済みとしてマーク
        await setCacheValue(notifiedKey, "true");
      } catch (error) {
        // Failed to send notification
      }
    }
  }
};

// キャッシュに値を保存
const setCacheValue = async (key, value) => {
  try {
    const cache = await caches.open("notification-flags-v1");
    await cache.put(
      new Request(`/notification-flag/${key}`),
      new Response(value, {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "max-age=86400",
        },
      }),
    );
  } catch (error) {
    // Failed to set cache value
  }
};

// キャッシュから値を取得
const getCacheValue = async (key) => {
  try {
    const cache = await caches.open("notification-flags-v1");
    const response = await cache.match(
      new Request(`/notification-flag/${key}`),
    );
    if (response) {
      return await response.text();
    }
  } catch (error) {
    // Failed to get cache value
  }

  return null;
};

// 通知クリック時の処理
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // アプリのURLを取得
  const urlToOpen = new URL("/", self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // 既に開いているウィンドウがあればフォーカス
        for (const client of clientList) {
          if (
            client.url.startsWith(self.location.origin) &&
            "focus" in client
          ) {
            return client.focus();
          }
        }
        // なければ新しいウィンドウを開く
        return clients.openWindow(urlToOpen);
      }),
  );
});

// Service Worker のインストール
self.addEventListener("install", () => {
  self.skipWaiting();
});

// Service Worker のアクティブ化
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
