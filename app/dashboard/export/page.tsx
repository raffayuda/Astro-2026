"use client";

import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { PageHeader, SectionCard } from "@/components/dashboard";
import { cn } from "@/lib/utils";
import { ky } from "@/src/lib/eden";

export default function ExportPage() {
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState("csv");

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await ky("/api/export");
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `astro-2026-pendaftaran-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengexport data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Export Data" description="Download data pendaftaran dalam format CSV." />

      <SectionCard
        icon={<FileSpreadsheet className="size-4 text-primary" />}
        title="Export Pendaftaran"
        description="Semua data pendaftaran termasuk status pembayaran akan diexport."
        bodyClassName="space-y-6 pt-2"
      >
        <Field>
          <FieldLabel className="text-10 font-bold uppercase tracking-[0.15em] text-muted-foreground">
            Format File
          </FieldLabel>
          <RadioGroup value={format} onValueChange={setFormat} className="flex gap-3">
            <label
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 transition-colors",
                format === "csv"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50",
              )}
            >
              <RadioGroupItem value="csv" />
              <span className="text-sm font-medium text-foreground">CSV</span>
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-border px-4 py-3 opacity-50">
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
      </SectionCard>
    </div>
  );
}
