"use client";

/** Units — stored on this device (localStorage), read by the logger and Stats labels. */
import { useEffect, useState } from "react";
import { Card, ScreenHeader, Seg } from "@/components/kit";

type Weight = "lbs" | "kg";
type Distance = "miles" | "km";

export default function SettingsUnitsPage() {
  const [weight, setWeight] = useState<Weight>("lbs");
  const [distance, setDistance] = useState<Distance>("miles");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setWeight((localStorage.getItem("ft-weight-unit") as Weight) || "lbs");
      setDistance((localStorage.getItem("ft-distance-unit") as Distance) || "miles");
    } catch {
      /* private mode */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("ft-weight-unit", weight);
      localStorage.setItem("ft-distance-unit", distance);
    } catch {
      /* ignore */
    }
  }, [ready, weight, distance]);

  return (
    <div className="pb-8">
      <ScreenHeader title="Units" back={{ href: "/settings", label: "Settings" }} sub="Saved on this device" />
      <div className="px-5">
        <Card className="flex flex-col gap-4 px-4 py-4">
          <div>
            <div className="t-eyebrow mb-1.5">Weight</div>
            <Seg
              options={[
                { value: "lbs", label: "Pounds" },
                { value: "kg", label: "Kilograms" },
              ]}
              value={weight}
              onChange={setWeight}
            />
          </div>
          <div>
            <div className="t-eyebrow mb-1.5">Distance</div>
            <Seg
              options={[
                { value: "miles", label: "Miles" },
                { value: "km", label: "Kilometres" },
              ]}
              value={distance}
              onChange={setDistance}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
