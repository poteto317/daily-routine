// カスタムService Worker - Workboxと通知機能を統合
/// <reference lib="webworker" />

import { ExpirationPlugin } from "workbox-expiration";
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
import { logToClient } from "./custom-sw/logToClient";
import { handleSchedulerMessage } from "./custom-sw/schedulerControl";
import { handleNotificationClick } from "./custom-sw/notificationClickHandler";

// Workboxの事前キャッシュ（ビルド時に__WB_MANIFESTが注入される）
precacheAndRoute(self.__WB_MANIFEST || []);

// HTMLドキュメントはNetworkFirstで通常はネットワーク優先、失敗時のみキャッシュへフォールバックする
registerRoute(
  ({ request }) => request.destination === "document",
  new NetworkFirst({
    cacheName: "document-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7日間：オフライン時のフォールバックとして機能させるため
      }),
    ],
  }),
);

// スクリプト・スタイルはStaleWhileRevalidate（コンテンツハッシュ付きURLで安全）
registerRoute(
  ({ request }) =>
    request.destination === "script" || request.destination === "style",
  new StaleWhileRevalidate({
    cacheName: "dynamic-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30日間：古いチャンクの蓄積を防ぐ
      }),
    ],
  }),
);

self.addEventListener("install", () => {
  self.skipWaiting();
  logToClient("[Custom SW] Installing...");
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.clients.claim().then(() => {
      logToClient("[Custom SW] Activated and claimed clients");
    }),
  );
});

// メッセージリスナー：メインスレッドからスケジュールを受信
self.addEventListener("message", (event) => {
  logToClient(`[Custom SW] Message received: ${JSON.stringify(event.data)}`);
  handleSchedulerMessage(event);
});

// 通知クリック時の処理
self.addEventListener("notificationclick", handleNotificationClick);

// 起動時にクライアントに通知
logToClient("[Custom SW] Service Worker loaded and ready");
