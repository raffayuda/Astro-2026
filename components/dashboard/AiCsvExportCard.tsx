"use client";

import { memo } from "react";
import { FileSpreadsheet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface CsvExportData {
  type: "CSV_EXPORT";
  filename: string;
  csvContent: string;
  rowCount: number;
  summary: string;
}

export const AiCsvExportCard = memo(function AiCsvExportCard({ exportData }: { exportData: CsvExportData }) {
  const handleDownload = () => {
    try {
      const blob = new Blob([exportData.csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", exportData.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Berkas ${exportData.filename} berhasil diunduh!`);
    } catch {
      toast.error("Gagal mengunduh berkas CSV.");
    }
  };

  return (
    <div className="my-3 rounded-2xl border border-astro-cyan-2/80 bg-linear-to-b from-white to-sky-50/50 shadow-soft p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-astro-blue/10 border border-astro-blue/20 flex items-center justify-center text-astro-blue shrink-0">
          <FileSpreadsheet className="size-5" />
        </div>
        <div>
          <h4 className="font-bold text-xs md:text-sm text-astro-navy font-title">
            {exportData.filename}
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {exportData.summary}
          </p>
        </div>
      </div>

      <Button
        type="button"
        size="sm"
        onClick={handleDownload}
        className="bg-astro-navy hover:bg-astro-blue text-white text-xs font-bold h-8 px-3.5 shrink-0 shadow-xs cursor-pointer"
      >
        <Download className="size-3.5 mr-1.5" />
        <span>Unduh CSV ({exportData.rowCount} Data)</span>
      </Button>
    </div>
  );
});
