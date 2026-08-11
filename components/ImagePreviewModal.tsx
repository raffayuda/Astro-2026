'use client';

import * as React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { normalizeImageUrl } from "@/components/ImportCommittee";

interface ImagePreviewModalProps {
  url: string | null;
  onClose: () => void;
  title?: string;
}

export default function ImagePreviewModal({ url, onClose, title = "Preview Gambar" }: ImagePreviewModalProps) {
  return (
    <Dialog open={!!url} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl border-border bg-card p-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative mt-2 flex min-h-[50vh] w-full items-center justify-center overflow-hidden rounded-md bg-muted/30">
          {url && (
            <Image
              src={normalizeImageUrl(url)}
              alt="Preview"
              fill
              className="object-contain"
              unoptimized
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
