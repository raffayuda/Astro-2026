'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Printer, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResponsiveAlertDialog } from '@/components/responsive-alert-dialog';
import { apiHelpers } from '@/src/lib/api';
import { toast } from 'sonner';
import PrintableInvoice, { PrintPortal, type PrintableInvoiceData } from '@/components/PrintableInvoice';

interface Props {
  registration: PrintableInvoiceData;
}

export default function RegistrationDetailActions({ registration }: Props) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [printing, setPrinting] = useState(false);

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await apiHelpers.registrations.delete(registration.id);
      toast.success('Pendaftaran berhasil dihapus');
      router.push('/dashboard/registrations');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus pendaftaran');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="rounded-lg text-xs font-bold uppercase gap-1.5 bg-white text-astro-navy hover:text-astro-navy hover:border-astro-sky"
        >
          <Printer className="size-3.5 text-astro-blue" /> Cetak Invoice
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          className="rounded-lg text-xs font-bold uppercase gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
        >
          <Trash2 className="size-3.5" /> Hapus
        </Button>
      </div>

      <ResponsiveAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Pendaftaran Ini?"
        description={
          <span>
            Apakah Anda yakin ingin menghapus pendaftaran untuk{' '}
            <strong>
              {registration.type === 'team' ? registration.teamName : registration.fullName}
            </strong>{' '}
            (Ref: <code className="font-mono">{registration.paymentReference}</code>)? Seluruh data peserta dan berkas terkait akan dihapus secara permanen.
          </span>
        }
        confirmText="Ya, Hapus Pendaftaran"
        cancelText="Batal"
        destructive
        loading={deleteLoading}
        onConfirm={handleDelete}
      />

      {printing && (
        <PrintPortal>
          <PrintableInvoice data={registration} />
        </PrintPortal>
      )}
    </>
  );
}
