import type { Metadata } from "next";
import SensorChart from "@/components/SensorChart";

export const metadata: Metadata = {
  title: "Humidity",
};

// Sensor 2 — давач вологості (тип давача, доданий у ЛР1, контролер humidity-sensors).
// Дані з API: GET {NEXT_PUBLIC_API_URL}/humidity-sensors
export default function DashboardHumidity() {
  return (
    <div className="py-2">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        Графік сенсора вологості
      </h1>
      <SensorChart
        endpoint="humidity-sensors"
        title="Sensor 2 · Вологість"
        unit="%"
        color="var(--chart-humidity)"
      />
    </div>
  );
}
