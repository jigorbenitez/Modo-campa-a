"use client";

import { useEffect, useState } from "react";

export function useStopwatch(startedAt?: number, stoppedAt?: number) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startedAt || stoppedAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [startedAt, stoppedAt]);

  const elapsed = startedAt ? Math.max(0, (stoppedAt ?? now) - startedAt) : 0;
  const totalSeconds = Math.floor(elapsed / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    elapsed,
    formatted: [hours, minutes, seconds]
      .map((value) => value.toString().padStart(2, "0"))
      .join(":"),
  };
}
