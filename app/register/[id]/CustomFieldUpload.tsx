"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Trash2, UploadCloud, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { apiHelpers } from "@/src/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  description?: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
  required?: boolean;
}

export default function CustomFieldUpload({
  label,
  description,
  value,
  onChange,
  error,
  required,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Berkas harus berupa gambar (PNG, JPG, WEBP)");
      return;
    }
    setUploading(true);
    try {
      const { url } = await apiHelpers.uploadPlayerPhoto(file);
      onChange(url);
      toast.success("Berkas berhasil diunggah");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload berkas gagal");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <Field data-invalid={!!error}>
      <FieldLabel required={required}>{label}</FieldLabel>
      {description && (
        <p className="text-11 font-normal text-muted-foreground -mt-1">{description}</p>
      )}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative flex flex-col items-center justify-center gap-2.5 rounded-lg border-2 border-dashed p-4 text-center transition-all cursor-pointer",
          isDragging
            ? "border-primary bg-primary/10 scale-[1.01] shadow-inner"
            : value
              ? "border-border/80 bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
              : "border-border hover:border-primary/60 hover:bg-muted/30 bg-muted/10",
          uploading && "opacity-60 pointer-events-none",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          disabled={uploading}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {value ? (
          <div className="flex items-center gap-3 w-full" onClick={(e) => e.stopPropagation()}>
            <span className="relative size-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
              <Image src={value} alt={label} fill sizes="56px" className="object-cover" />
            </span>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-bold text-foreground truncate">
                {label} (Berhasil Diunggah)
              </p>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-11 text-primary hover:underline mt-0.5"
              >
                <ExternalLink className="size-3" />
                Lihat gambar ukuran penuh
              </a>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className="text-10 font-bold uppercase tracking-wider"
              >
                {uploading ? (
                  <>
                    <Spinner data-icon="inline-start" /> Mengunggah...
                  </>
                ) : (
                  "Ganti Berkas"
                )}
              </Button>
              {!uploading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Hapus berkas"
                  onClick={() => onChange("")}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-full transition-colors",
                isDragging
                  ? "bg-primary text-primary-foreground animate-bounce"
                  : "bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10",
              )}
            >
              {uploading ? <Spinner className="size-5" /> : <UploadCloud className="size-5" />}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                {uploading
                  ? "Sedang mengunggah dan mengoptimasi gambar..."
                  : isDragging
                    ? "Lepaskan berkas di sini..."
                    : `Tarik & lepas gambar ${label.toLowerCase()} di sini, atau klik untuk memilih file`}
              </p>
              <p className="text-10 text-muted-foreground mt-0.5">
                PNG, JPG, WEBP (otomatis dikompresi)
              </p>
            </div>
          </>
        )}
      </div>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}
