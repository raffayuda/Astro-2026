"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(deadline: string): TimeLeft {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Registration deadline countdown.
 *
 * `inline` is one line of text, for places where the deadline is a supporting
 * detail rather than the subject — a hero that already carries a headline and
 * two buttons does not need four number tiles competing with them.
 * `row` keeps the larger divided figures for a section that is about the date.
 */
export default function CountdownTimer({
  deadline,
  variant = "row",
  className,
}: {
  deadline: string;
  variant?: "row" | "inline";
  className?: string;
}) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(calcTimeLeft(deadline));
    const timer = setInterval(() => setTimeLeft(calcTimeLeft(deadline)), 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (variant === "inline") {
    return (
      <p className={cn("text-sm font-semibold text-astro-navy/70", className)}>
        Pendaftaran ditutup dalam{" "}
        <span className="font-bold tabular-nums text-astro-navy">
          {timeLeft
            ? `${timeLeft.days} hari ${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`
            : "—"}
        </span>
      </p>
    );
  }

  const items = [
    { value: timeLeft?.days, label: "Hari" },
    { value: timeLeft?.hours, label: "Jam" },
    { value: timeLeft?.minutes, label: "Menit" },
    { value: timeLeft?.seconds, label: "Detik" },
  ];

  return (
    <div
      className={cn(
        "flex w-fit items-stretch divide-x divide-astro-cyan-2/45",
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center px-4 first:pl-0 last:pr-0"
        >
          <span className="font-heading text-3xl font-black leading-none tabular-nums text-astro-navy sm:text-4xl">
            {item.value === undefined ? "--" : pad(item.value)}
          </span>
          <span className="mt-1.5 text-9 font-black uppercase tracking-[0.18em] text-muted-foreground">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
