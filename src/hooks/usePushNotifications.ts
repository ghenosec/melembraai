"use client";

import { useEffect, useState } from "react";

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const isSupported =
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window;

    setSupported(isSupported);

    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, []);

  const subscribe = async (): Promise<boolean> => {
    if (!supported) return false;

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") return false;

      const registration = await navigator.serviceWorker.register("/sw-push.js");
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!response.ok) throw new Error("Erro ao salvar subscription");

      console.log("[meLembraAI] Push notifications ativadas");
      return true;
    } catch (error) {
      console.error("[meLembraAI] Erro ao ativar push:", error);
      return false;
    }
  };

  return { supported, permission, subscribe };
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}