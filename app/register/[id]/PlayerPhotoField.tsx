"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { apiHelpers } from "@/src/lib/api";
import { toast } from "sonner";

interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
  required?: boolean;
  /** Rendered as a compact row (member roster) instead of a full field. */
  compact?: boolean;
}

/**
 * Player photo upload. The file goes straight to Supabase via the anonymous
 * `/upload/player-photo` endpoint and only the resulting URL lands in the form.
 */
export default function PlayerPhotoField({
  label,
  value,
  onChange,
  error,
  required,
  compact,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await apiHelpers.uploadPlayerPhoto(file);
      onChange(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload foto gagal");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const picker = (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <span className="relative size-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
          <Image src={value} alt={label} fill sizes="56px" className="object-cover" />
        </span>
      ) : (
        <span className="flex size-14 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-muted-foreground">
          <ImageUp className="size-5" />
        </span>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="text-[11px] font-bold uppercase tracking-wider"
      >
        {uploading ? (
          <>
            <Spinner data-icon="inline-start" /> Mengunggah...
          </>
        ) : value ? (
          "Ganti Foto"
        ) : (
          "Unggah Foto"
        )}
      </Button>

      {value && !uploading && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Hapus foto"
          onClick={() => onChange("")}
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-1">
        {picker}
        {error ? (
          <p className="text-xs font-medium text-destructive">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <Field data-invalid={!!error}>
      <FieldLabel required={required}>{label}</FieldLabel>
      {picker}
      <p className="text-[11px] font-light text-muted-foreground">
        Foto pemain (formal atau non-formal), PNG/JPG/WEBP maks. 5MB.
      </p>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  );
}
