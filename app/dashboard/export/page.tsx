"use client";

import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { PageHeader, PageShell, SectionCard } from "@/components/dashboard";
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
    <PageShell narrow>
      <PageHeader
        title="Export Data"
        description="Download data pendaftaran dalam format CSV."
      />

      <SectionCard
        icon={<FileSpreadsheet className="size-4 text-muted-foreground" />}
        title="Export Pendaftaran"
        description="Semua data termasuk status pembayaran akan diexport."
        bodyClassName="space-y-6"
      >
        <Field>
          <FieldLabel>Format File</FieldLabel>
          <RadioGroup
            value={format}
            onValueChange={setFormat}
            className="mt-2 grid gap-2 sm:grid-cols-2"
          >
            <Label
              htmlFor="format-csv"
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
            >
              <RadioGroupItem value="csv" id="format-csv" />
              <span className="text-sm font-medium">CSV</span>
            </Label>
            <Label
              htmlFor="format-xlsx"
              className="flex cursor-not-allowed items-center gap-3 rounded-lg border border-border px-4 py-3 opacity-50"
            >
              <RadioGroupItem value="xlsx" id="format-xlsx" disabled />
              <span className="text-sm font-medium text-muted-foreground">XLSX (segera)</span>
            </Label>
          </RadioGroup>
        </Field>

        <Button onClick={handleExport} disabled={loading} className="w-full sm:w-auto">
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
    </PageShell>
  );
}
