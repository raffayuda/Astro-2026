"use client";

import { useEffect, useState } from "react";

export function useOtpCooldown() {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown === 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  return { cooldown, startCooldown: () => setCooldown(60) };
}
