'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Spinner } from '@/components/ui/spinner';
import { ky } from '@/src/lib/eden';

export default function ExportPage() {
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState('csv');

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await ky('/api/export');
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `astro-2026-pendaftaran-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengexport data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Export Data</h1>
        <p className="mt-1 text-sm font-light text-muted-foreground">
          Download data pendaftaran dalam format CSV.
        </p>
      </div>

      <Card className="rounded-xl relative overflow-hidden border-border">
        <div className="absolute -top-px -left-px size-8 bg-primary" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="size-8 text-primary" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-foreground">Export Pendaftaran</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Semua data pendaftaran termasuk status pembayaran akan diexport.
              </p>
            </div>
          </div>

          <Field>
            <FieldLabel className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Format File</FieldLabel>
            <RadioGroup value={format} onValueChange={setFormat} className="flex gap-3">
              <label className={format === 'csv' ? 'flex items-center gap-2 border border-primary bg-primary/10 px-4 py-3' : 'flex cursor-pointer items-center gap-2 border border-border px-4 py-3 transition-colors hover:border-border'} style={{ clipPath: 'polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%)' }}>
                <RadioGroupItem value="csv" />
                <span className="text-sm font-medium text-foreground">CSV</span>
              </label>
              <label className="flex items-center gap-2 border border-border px-4 py-3 opacity-50" style={{ clipPath: 'polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%)' }}>
                <RadioGroupItem value="xlsx" disabled />
                <span className="text-sm font-medium text-muted-foreground">XLSX (coming soon)</span>
              </label>
            </RadioGroup>
          </Field>

          <Button
            onClick={handleExport}
            disabled={loading}
            size="lg"
            className="rounded-lg text-sm font-black uppercase tracking-wider active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Spinner data-icon="inline-start" /> Mengexport...
              </>
            ) : (
              <>
                <Download data-icon="inline-start" /> Download CSV
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
