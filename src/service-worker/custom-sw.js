// カスタムService Worker - Workboxと通知機能を統合
/// <reference lib="webworker" />

import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";
import { logToClient } from "./custom-sw/logToClient";
import { handleSchedulerMessage } from "./custom-sw/schedulerControl";
import { handleNotificationClick } from "./custom-sw/notificationClickHandler";

// Workboxの事前キャッシュ（ビルド時に__WB_MANIFESTが注入される）
precacheAndRoute(self.__WB_MANIFEST || []);

// 動的なコンテンツのキャッシング戦略
registerRoute(
  ({ request }) =>
    request.destination === "document" ||
    request.destination === "script" ||
    request.destination === "style",
  new StaleWhileRevalidate({
    cacheName: "dynamic-cache",
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
