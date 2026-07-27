"use client";

import { useEffect, useState } from "react";

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
}

type NavigatorWithBattery = Navigator & {
  getBattery?: () => Promise<BatteryManager>;
};

export function useDeviceBattery() {
  const [battery, setBattery] = useState<{ level: number; charging: boolean }>();

  useEffect(() => {
    const getBattery = (navigator as NavigatorWithBattery).getBattery;
    if (!getBattery) return;
    let manager: BatteryManager | undefined;
    const update = () => {
      if (manager) setBattery({ level: Math.round(manager.level * 100), charging: manager.charging });
    };

    getBattery.call(navigator).then((value) => {
      manager = value;
      update();
      manager.addEventListener("levelchange", update);
      manager.addEventListener("chargingchange", update);
    }).catch(() => undefined);

    return () => {
      manager?.removeEventListener("levelchange", update);
      manager?.removeEventListener("chargingchange", update);
    };
  }, []);

  return battery;
}
