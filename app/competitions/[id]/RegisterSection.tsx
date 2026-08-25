'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import type { Competition } from '@/types/astro';

interface Props {
  competition: Competition;
}

export default function RegisterSection({ competition }: Props) {
  const router = useRouter();
  const isOpen = competition.isActive !== false;
  const isFull = competition.maxSlots > 0 && competition.filledSlots >= competition.maxSlots;

  if (!isOpen) {
    return (
      <div className="w-full text-center space-y-2">
        <Button
          disabled
          size="lg"
          className="clip-angled mx-auto w-full max-w-md text-sm font-black uppercase tracking-wider opacity-60 cursor-not-allowed bg-slate-300 text-slate-600 hover:bg-slate-300 gap-2"
        >
          <Lock className="size-4" /> Pendaftaran Ditutup
        </Button>
        <p className="text-xs text-slate-500">
          Mohon maaf, pendaftaran untuk kompetisi ini sedang tidak dibuka.
        </p>
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="w-full text-center space-y-2">
        <Button
          disabled
          size="lg"
          className="clip-angled mx-auto w-full max-w-md text-sm font-black uppercase tracking-wider opacity-60 cursor-not-allowed bg-amber-200 text-amber-800 hover:bg-amber-200 gap-2"
        >
          <Lock className="size-4" /> Kuota Penuh
        </Button>
        <p className="text-xs text-slate-500">
          Kuota pendaftaran untuk kompetisi ini telah terisi penuh.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full text-center">
      <Button
        onClick={() => router.push(`/register/${competition.id}`)}
        size="lg"
        className="clip-angled mx-auto w-full max-w-md text-sm font-black uppercase tracking-wider active:scale-95"
      >
        Daftar {competition.title}
      </Button>
    </div>
  );
}
