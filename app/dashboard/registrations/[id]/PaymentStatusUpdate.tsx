'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { apiHelpers } from '@/src/lib/api';

interface Props {
  registrationId: string;
  currentStatus: string;
}

export default function PaymentStatusUpdate({ registrationId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await apiHelpers.registrations.update(registrationId, { paymentStatus: status });

      setDone(true);
      router.refresh();
      setTimeout(() => setDone(false), 2000);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 border-t border-border pt-3">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Update Status Pembayaran
      </span>
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="clip-angled-sm h-10 w-full bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="detecting">Detecting</SelectItem>
            <SelectItem value="paid">Paid / Lunas</SelectItem>
            <SelectItem value="failed">Failed / Gagal</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Button
        onClick={handleUpdate}
        disabled={loading || status === currentStatus}
        className="clip-angled-sm w-full text-xs font-bold uppercase tracking-wider"
      >
        {loading ? (
          <Spinner data-icon="inline-start" />
        ) : done ? (
          <><Check data-icon="inline-start" /> Tersimpan</>
        ) : (
          'Simpan Perubahan'
        )}
      </Button>
    </div>
  );
}
