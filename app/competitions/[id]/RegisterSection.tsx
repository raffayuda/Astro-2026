"use client";

import { CtaButton } from "@/components/brand/CtaButton";
import { Button } from "@/components/ui/button";
import type { Competition } from "@/types/astro";

export default function RegisterSection({ competition }: { competition: Competition }) {
  const isOpen = competition.isActive !== false;
  const isFull = competition.maxSlots > 0 && competition.filledSlots >= competition.maxSlots;

  if (!isOpen) {
    return (
      <div className="space-y-2">
        <Button disabled size="lg" className="rounded-full">
          Pendaftaran ditutup
        </Button>
        <p className="text-sm font-medium text-ink/70">
          Pendaftaran untuk lomba ini sedang tidak dibuka.
        </p>
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="space-y-2">
        <Button disabled size="lg" className="rounded-full">
          Kuota penuh
        </Button>
        <p className="text-sm font-medium text-ink/70">
          Kuota pendaftaran sudah terisi. Cek lomba lain di katalog.
        </p>
      </div>
    );
  }

  return (
    <CtaButton href={`/register/${competition.id}`} size="lg">
      Daftar
    </CtaButton>
  );
}
