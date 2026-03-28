const NOTIFICATION_FLAGS_CACHE = "notification-flags-v1";

export const setCacheValue = async (key, value) => {
  try {
    const cache = await caches.open(NOTIFICATION_FLAGS_CACHE);
    await cache.put(
      new Request(`/notification-flag/${key}`),
      new Response(value, {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "max-age=86400",
        },
      }),
    );
  } catch {
    // Failed to set cache value
  }
};

export const getCacheValue = async (key) => {
  try {
    const cache = await caches.open(NOTIFICATION_FLAGS_CACHE);
    const response = await cache.match(
      new Request(`/notification-flag/${key}`),
    );
    if (response) {
      return await response.text();
    }
  } catch {
    // Failed to get cache value
  }

  return null;
};
