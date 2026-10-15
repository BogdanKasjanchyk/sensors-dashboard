import type { Metadata } from "next";
import SensorChart from "@/components/SensorChart";

export const metadata: Metadata = {
  title: "Temperature",
};

// Sensor 1 — давач температури; дані з API: GET {NEXT_PUBLIC_API_URL}/temperature-sensors
export default function DashboardTemp() {
  return (
    <div className="py-2">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        Графік температурного сенсора
      </h1>
      <SensorChart
        endpoint="temperature-sensors"
        title="Sensor 1 · Температура"
        unit="°C"
        color="var(--chart-temp)"
      />
    </div>
  );
}
