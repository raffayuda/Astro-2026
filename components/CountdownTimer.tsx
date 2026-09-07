'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Surface } from '@/components/brand';

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

function Block({ value, label, delay }: { value: number; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
    >
      <Surface
        tone="plain"
        radius="xl"
        pad="sm"
        className="flex min-w-[68px] flex-col items-center md:min-w-[88px] md:px-5 md:py-4"
      >
        <span className="font-mono text-2xl font-black leading-none tracking-wider text-astro-blue tabular-nums md:text-4xl">
          {String(value).padStart(2, '0')}
        </span>
        <span className="mt-1.5 text-9 font-black uppercase tracking-[0.15em] text-astro-navy/70 md:text-10">
          {label}
        </span>
      </Surface>
    </motion.div>
  );
}

export default function CountdownTimer({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calcTimeLeft(deadline));
    const timer = setInterval(() => setTimeLeft(calcTimeLeft(deadline)), 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  const items = [
    { value: timeLeft.days, label: 'Hari', delay: 0.6 },
    { value: timeLeft.hours, label: 'Jam', delay: 0.65 },
    { value: timeLeft.minutes, label: 'Menit', delay: 0.7 },
    { value: timeLeft.seconds, label: 'Detik', delay: 0.75 },
  ];

  return (
    <div className="flex gap-2 md:gap-3 justify-center">
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center gap-2 md:gap-3">
          {mounted ? (
            <Block value={item.value} label={item.label} delay={item.delay} />
          ) : (
            <Surface
              tone="plain"
              radius="xl"
              pad="sm"
              className="flex min-w-[68px] flex-col items-center md:min-w-[88px] md:px-5 md:py-4"
            >
              <span className="text-2xl md:text-4xl font-black text-astro-navy/40 font-mono tracking-wider">--</span>
              <span className="text-9 md:text-10 uppercase text-ink tracking-[0.15em] mt-1.5 font-bold">{item.label}</span>
            </Surface>
          )}
          {i < items.length - 1 && (
            <span className="text-ink text-lg md:text-xl font-bold mb-4">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
