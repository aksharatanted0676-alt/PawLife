"use client";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export async function registerBrowserPush(token: string) {
  if (!("serviceWorker" in navigator)) throw new Error("Service worker not supported");
  if (!("PushManager" in window)) throw new Error("Push not supported");

  const vapidPublicKey = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) throw new Error("Missing NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notifications permission denied");

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
  });

  // Use API client to register subscription on backend.
  // Note: we keep this isolated so delivery can be added later without frontend changes.
  await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/push/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(subscription)
  }).then(async (r) => {
    if (!r.ok) throw new Error((await r.text()) || "Push subscribe failed");
  });

  return subscription;
}

export async function unregisterBrowserPush(token: string) {
  const registration = await navigator.serviceWorker.ready;
  const sub = await registration.pushManager.getSubscription();
  if (!sub) return { success: true };
  await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/push/unsubscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ endpoint: sub.endpoint })
  }).then(async (r) => {
    if (!r.ok) throw new Error((await r.text()) || "Push unsubscribe failed");
  });
  await sub.unsubscribe();
  return { success: true };
}

export async function getBrowserPushSubscription() {
  if (!("serviceWorker" in navigator)) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

