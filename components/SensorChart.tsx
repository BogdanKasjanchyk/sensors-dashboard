"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/** Запис давача у форматі, який повертає серверний застосунок (NestJS) */
interface ApiReading {
  id: string;
  sensorName: string;
  value: number;
  unit: string;
  timestamp: string;
  location?: string;
}

interface Reading {
  id: string;
  time: string;
  value: number;
  sensorName: string;
}

interface SensorChartProps {
  /** Маршрут контролера на сервері, напр. "temperature-sensors" */
  endpoint: string;
  /** Назва, що відображається в заголовку графіку */
  title: string;
  unit: string;
  /** CSS-колір лінії, напр. "var(--chart-temp)" */
  color: string;
}

type Status = "loading" | "ready" | "error";

/** Як часто оновлювати дані (мс) */
const REFRESH_MS = 10_000;
/** Безкоштовний Render «прокидається» до ~1 хв, тому тайм-аут щедрий */
const TIMEOUT_MS = 60_000;
/** Через скільки мс показати підказку про пробудження сервера */
const SLOW_HINT_MS = 4_000;
/** Скільки останніх точок показувати на графіку */
const MAX_POINTS = 50;

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

const fmt = (v: number) => v.toFixed(1);
const fmtTime = (d: Date) =>
  d.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export default function SensorChart({ endpoint, title, unit, color }: SensorChartProps) {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [slow, setSlow] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const hasData = useRef(false);

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      if (!apiUrl) return;
      setRefreshing(true);
      const slowTimer = setTimeout(() => setSlow(true), SLOW_HINT_MS);
      const timeout = AbortSignal.timeout(TIMEOUT_MS);
      const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

      try {
        const res = await fetch(`${apiUrl}/${endpoint}`, {
          signal: combined,
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Сервер відповів зі статусом ${res.status}`);
        const data: ApiReading[] = await res.json();

        const formatted = data
          .toSorted(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          )
          .slice(-MAX_POINTS)
          .map((item) => ({
            id: item.id,
            time: fmtTime(new Date(item.timestamp)),
            value: Number(item.value),
            sensorName: item.sensorName,
          }));

        setReadings(formatted);
        setStatus("ready");
        setError(null);
        setUpdatedAt(new Date());
        hasData.current = true;
      } catch (e) {
        if (signal?.aborted) return; // компонент розмонтовано — нічого не робимо
        console.error("Fetching data:", e);
        const message =
          e instanceof DOMException && e.name === "TimeoutError"
            ? "Сервер не відповів за 60 с."
            : e instanceof TypeError
              ? "Не вдалося з'єднатися з сервером (мережа або CORS)."
              : e instanceof Error
                ? e.message
                : "Невідома помилка.";
        setError(message);
        // Якщо дані вже є — залишаємо графік і лише показуємо попередження
        if (!hasData.current) setStatus("error");
      } finally {
        clearTimeout(slowTimer);
        setSlow(false);
        setRefreshing(false);
      }
    },
    [endpoint],
  );

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- початкове завантаження з API
    fetchData(controller.signal);
    const interval = setInterval(() => fetchData(controller.signal), REFRESH_MS);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchData]);

  if (!apiUrl) {
    return (
      <Notice tone="error" title="Не задано адресу API">
        Створіть файл <code className="font-mono">.env</code> у корені проєкту з рядком{" "}
        <code className="font-mono">NEXT_PUBLIC_API_URL=https://&lt;ім&apos;я&gt;.onrender.com</code>{" "}
        (або додайте змінну в налаштуваннях Vercel) і перезапустіть застосунок.
      </Notice>
    );
  }

  const values = readings.map((r) => r.value);
  const stats = [
    { label: "Поточне", value: values.at(-1) },
    { label: "Мінімум", value: values.length ? Math.min(...values) : undefined },
    { label: "Максимум", value: values.length ? Math.max(...values) : undefined },
    {
      label: "Середнє",
      value: values.length ? values.reduce((a, b) => a + b, 0) / values.length : undefined,
    },
  ];

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {s.label}
            </dt>
            <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums">
              {status === "loading" ? (
                <span className="inline-block h-7 w-16 animate-pulse rounded-md bg-border align-middle" />
              ) : (
                <>
                  {s.value === undefined ? "—" : fmt(s.value)}
                  <span className="ml-1 text-sm font-normal text-muted">{unit}</span>
                </>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-medium">{title}</h2>
          <p className="flex items-center gap-2 text-xs text-muted" aria-live="polite">
            <span
              className={`size-2 rounded-full ${
                error ? "bg-amber-500" : refreshing ? "animate-pulse bg-accent" : "bg-emerald-500"
              }`}
              aria-hidden
            />
            {updatedAt ? `Оновлено о ${fmtTime(updatedAt)}` : "Завантаження…"}
            <span className="hidden sm:inline">· {readings.length} записів</span>
          </p>
        </div>

        {error && status === "ready" && (
          <p className="mb-3 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
            Не вдалося оновити дані: {error} Показано останні отримані значення.
          </p>
        )}

        <div className="h-64 sm:h-80">
          {status === "loading" && (
            <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl bg-border/30 animate-pulse">
              <p className="text-sm text-muted">Завантаження даних…</p>
              {slow && (
                <p className="max-w-sm text-center text-xs text-muted">
                  Сервер на безкоштовному плані Render прокидається після сну — це може
                  зайняти до хвилини.
                </p>
              )}
            </div>
          )}

          {status === "error" && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="font-medium">Не вдалося отримати дані</p>
              <p className="max-w-sm text-sm text-muted">{error}</p>
              <button
                id={`retry-${endpoint}`}
                type="button"
                onClick={() => {
                  setStatus("loading");
                  fetchData();
                }}
                className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
              >
                Спробувати ще раз
              </button>
            </div>
          )}

          {status === "ready" && readings.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <p className="font-medium">Даних поки немає</p>
              <p className="max-w-md text-sm text-muted">
                Масив на сервері порожній (він очищується, коли Render присипляє сервіс).
                Надішліть кілька POST-запитів на{" "}
                <code className="font-mono text-foreground">/{endpoint}</code> через Postman —
                графік оновиться автоматично.
              </p>
            </div>
          )}

          {status === "ready" && readings.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={readings} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "var(--muted)", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  domain={[
                    (min: number) => Math.floor(min - 1),
                    (max: number) => Math.ceil(max + 1),
                  ]}
                  tick={{ fill: "var(--muted)", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  isAnimationActive={false}
                  formatter={(v, _name, item) => [
                    `${fmt(Number(v))} ${unit}`,
                    (item?.payload as Reading | undefined)?.sensorName ?? title,
                  ]}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--foreground)",
                  }}
                  labelStyle={{ color: "var(--muted)" }}
                  cursor={{ stroke: "var(--border)" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--surface)", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function Notice({
  tone,
  title,
  children,
}: {
  tone: "error";
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="alert"
      className={`rounded-2xl border p-4 sm:p-6 ${
        tone === "error" ? "border-red-500/30 bg-red-500/5" : ""
      }`}
    >
      <p className="mb-1 font-medium">{title}</p>
      <p className="text-sm leading-relaxed text-muted">{children}</p>
    </div>
  );
}
