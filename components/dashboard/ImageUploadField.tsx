"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import { normalizeImageUrl } from "@/components/ImportCommittee";
import { apiHelpers } from "@/src/lib/api";
import { errorMessage, isRecord } from "@/lib/flags";
import { cn } from "@/lib/utils";

/**
 * Upload-or-paste image control shared by the gallery, sponsor, and journey
 * editors. Each of them used to inline the same file input, the same
 * `apiHelpers.upload` call, and its own error handling.
 */
function ImageUploadField({
  value,
  onValueChange,
  allowUrl = true,
  buttonLabel = "Upload file",
  urlPlaceholder = "URL Google Drive / link gambar langsung...",
  className,
}: {
  value: string;
  onValueChange: (url: string) => void;
  allowUrl?: boolean;
  buttonLabel?: string;
  urlPlaceholder?: string;
  className?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadRes = await apiHelpers.upload(file);
      const url = isRecord(uploadRes) ? uploadRes.url : undefined;
      if (typeof url === "string" && url) {
        onValueChange(url);
        toast.success("File berhasil diunggah");
      }
    } catch (err) {
      toast.error(errorMessage(err, "Gagal mengunggah file"));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <label className={cn("cursor-pointer", uploading && "cursor-not-allowed")}>
          <span
            className={cn(
              "inline-block rounded-md border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
              uploading
                ? "cursor-not-allowed bg-primary text-primary-foreground opacity-70"
                : "bg-muted text-muted-foreground hover:bg-accent",
            )}
          >
            {uploading ? "Mengunggah..." : buttonLabel}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={handleFile}
          />
        </label>
        {allowUrl ? (
          <>
            <span className="text-10 text-muted-foreground">atau</span>
            <Input
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              placeholder={urlPlaceholder}
              className="min-w-48 flex-1"
            />
          </>
        ) : null}
      </div>

      {value ? (
        <div className="flex items-center gap-3 rounded-md border border-border bg-muted/50 p-3">
          <button
            type="button"
            onClick={() => setPreview(value)}
            className="overflow-hidden rounded transition-opacity hover:opacity-80"
          >
            <Image
              src={normalizeImageUrl(value)}
              alt="Preview"
              width={64}
              height={64}
              unoptimized
              className="size-16 object-cover"
            />
          </button>
          <span className="text-xs text-muted-foreground">Preview</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onValueChange("")}
            className="ml-auto text-xs text-destructive hover:text-destructive"
          >
            Hapus
          </Button>
        </div>
      ) : null}

      <ImagePreviewModal url={preview} onClose={() => setPreview(null)} />
    </div>
  );
}

export { ImageUploadField };
