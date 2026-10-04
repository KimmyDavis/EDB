/* Eglise de Boumerdes service worker - receives and displays web push notifications. */
const DEFAULT_ICON = "/images/EDB-logo.png";
const DEFAULT_BADGE = "/images/EDB-logo.png";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (error) {
      payload = { title: "Eglise de Boumerdes", body: event.data.text() };
    }
  }

  const title = payload.title || "Eglise de Boumerdes";
  const options = { ...payload };
  delete options.title;

  options.icon = options.icon || DEFAULT_ICON;
  options.badge = options.badge || DEFAULT_BADGE;

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/home";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
        return undefined;
      }),
  );
});
