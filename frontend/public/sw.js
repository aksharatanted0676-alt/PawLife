self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());

self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : { title: "PawLife Reminder", body: "You have a pet health alert." };
  event.waitUntil(
    self.registration.showNotification(payload.title || "PawLife", {
      body: payload.body || "Reminder triggered.",
      icon: "/favicon.ico",
      data: payload.data || {}
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(urlToOpen);
    })
  );
});
