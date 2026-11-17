"use client";

import { useEffect, useState } from "react";

/** Алерт, який надсилає сервер через SSE (GET {apiUrl}/{endpoint}/alerts) */
interface SensorAlert {
  message: string;
  /** Для давача температури */
  temperature?: number;
  /** Для давача вологості */
  humidity?: number;
  sensorName: string;
  timestamp: string;
  severity: "critical" | "warning";
}

interface SensorAlertsProps {
  /** Маршрут контролера на сервері, напр. "temperature-sensors" */
  endpoint: string;
}

/** Скільки останніх алертів тримати у стані */
const MAX_ALERTS = 5;

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

export default function SensorAlerts({ endpoint }: SensorAlertsProps) {
  const [alerts, setAlerts] = useState<SensorAlert[]>([]);

  useEffect(() => {
    if (!apiUrl) return;

    // Нативний браузерний API для Server-Sent Events
    const eventSource = new EventSource(`${apiUrl}/${endpoint}/alerts`);

    eventSource.onmessage = (event) => {
      const alert: SensorAlert = JSON.parse(event.data);
      // Новий алерт на початок, обмежуємо до 5 останніх; functional update — без race conditions
      setAlerts((prev) => [alert, ...prev].slice(0, MAX_ALERTS));
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      eventSource.close();
    };

    // Cleanup: закриваємо з'єднання при демонтуванні компонента
    return () => {
      eventSource.close();
    };
  }, [endpoint]);

  if (alerts.length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className="rounded border-l-4 border-red-500 bg-red-100 p-4 text-red-700 shadow-md"
          role="alert"
        >
          <p className="font-bold">⚠️ {alert.message}</p>
          <p className="text-sm">
            Давач: {alert.sensorName} | Час:{" "}
            {new Date(alert.timestamp).toLocaleTimeString("uk-UA")}
          </p>
        </div>
      ))}
    </div>
  );
}
