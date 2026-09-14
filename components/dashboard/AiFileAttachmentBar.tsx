"use client";

import React, { useRef, useImperativeHandle, forwardRef } from "react";
import {
  Paperclip,
  X,
  Loader2,
  FileText,
  FileSpreadsheet,
  FileCode,
  ImageIcon,
  File,
} from "lucide-react";
import { useAiChat } from "@/components/dashboard/AiChatContext";
import type { ParsedDocumentResult } from "@/src/server/ai/document-parser";

export interface AiFileAttachmentBarRef {
  triggerUpload: () => void;
}

interface AiFileAttachmentBarProps {
  compact?: boolean;
  onFileAttached?: () => void;
}

export function getFileIcon(fileType: string) {
  switch (fileType.toLowerCase()) {
    case "md":
    case "markdown":
    case "txt":
    case "json":
    case "rst":
      return <FileCode className="size-3.5 text-indigo-500 shrink-0" />;
    case "pdf":
      return <FileText className="size-3.5 text-rose-500 shrink-0" />;
    case "docx":
    case "doc":
      return <FileText className="size-3.5 text-sky-600 shrink-0" />;
    case "xlsx":
    case "xls":
    case "csv":
      return <FileSpreadsheet className="size-3.5 text-emerald-600 shrink-0" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "webp":
      return <ImageIcon className="size-3.5 text-amber-500 shrink-0" />;
    default:
      return <File className="size-3.5 text-slate-500 shrink-0" />;
  }
}

export const AiFileAttachmentBar = forwardRef<AiFileAttachmentBarRef, AiFileAttachmentBarProps>(
  function AiFileAttachmentBar({ compact = false, onFileAttached }, ref) {
    const {
      attachedFiles,
      uploadAndAttachFile,
      removeAttachedFile,
      isUploadingFile,
    } = useAiChat();

    const fileInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      triggerUpload: () => {
        if (!isUploadingFile) {
          fileInputRef.current?.click();
        }
      },
    }));

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file) {
          await uploadAndAttachFile(file);
        }
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onFileAttached?.();
    };

  return (
    <div className="flex flex-col gap-1.5">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        aria-label="Unggah berkas untuk AI Copilot"
        title="Unggah berkas (.md, .pdf, .docx, .xlsx, .csv, gambar)"
        accept=".md,.markdown,.pdf,.docx,.xlsx,.xls,.csv,.txt,.json,.png,.jpg,.jpeg,.webp"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Attached Files Chips Bar */}
      {(attachedFiles.length > 0 || isUploadingFile) && (
        <div className="flex items-center gap-1.5 flex-wrap px-1 py-1 animate-in fade-in-0 duration-200">
          {attachedFiles.map((f: ParsedDocumentResult) => (
            <div
              key={f.fileName}
              className={`group flex items-center gap-1.5 rounded-lg border bg-white shadow-2xs transition-all ${
                compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
              } ${
                f.fileType === "md" || f.fileType === "markdown"
                  ? "border-indigo-200 bg-indigo-50/40 text-indigo-950"
                  : f.fileType === "xlsx" || f.fileType === "csv"
                  ? "border-emerald-200 bg-emerald-50/40 text-emerald-950"
                  : f.fileType === "pdf"
                  ? "border-rose-200 bg-rose-50/40 text-rose-950"
                  : "border-slate-200 text-slate-800"
              }`}
            >
              {getFileIcon(f.fileType)}
              <span
                className={`truncate font-medium ${compact ? "max-w-[110px] text-[10px]" : "max-w-[140px] text-[11px]"}`}
                title={f.fileName}
              >
                {f.fileName}
              </span>
              <span className="text-[9px] uppercase tracking-wider px-1 py-0.2 rounded bg-black/5 font-semibold text-muted-foreground">
                {f.fileType}
              </span>
              <button
                type="button"
                onClick={() => removeAttachedFile(f.fileName)}
                className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:bg-black/10 hover:text-rose-600 transition-colors cursor-pointer"
                title="Hapus lampiran"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}

          {isUploadingFile && (
            <div className="flex items-center gap-1.5 rounded-lg border border-astro-blue/30 bg-sky-50 px-2.5 py-1 text-xs text-astro-blue">
              <Loader2 className="size-3.5 animate-spin" />
              <span className="text-[11px] font-medium">Membaca isi berkas...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export function AiUploadTriggerButton({
  onClick,
  disabled,
  compact = false,
}: {
  onClick?: () => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center rounded-xl text-muted-foreground hover:text-astro-blue hover:bg-sky-50 transition-colors disabled:opacity-50 cursor-pointer ${
        compact ? "size-8" : "size-9"
      }`}
      title="Lampirkan berkas Juknis (.md, .pdf, .docx), Excel (.xlsx, .csv), atau gambar"
    >
      <Paperclip className={compact ? "size-3.5" : "size-4"} />
    </button>
  );
}

export function formatUserMessageDisplay(rawText: string) {
  const fileContextIndex = rawText.indexOf("[DOKUMEN TERLAMPIR DARI ADMIN]:");
  if (fileContextIndex === -1) {
    return {
      text: rawText,
      attachedFiles: [] as { fileName: string; fileType: string }[],
    };
  }

  const userPrompt = rawText.slice(0, fileContextIndex).trim();
  const fileContextPart = rawText.slice(fileContextIndex);

  const fileMatches = Array.from(
    fileContextPart.matchAll(/<uploaded_file_context filename="([^"]+)" type="([^"]+)">/g)
  );

  const attachedFiles = fileMatches.map((m) => ({
    fileName: m[1] || "Dokumen",
    fileType: m[2] || "file",
  }));

  return {
    text: userPrompt || "Tolong analisa berkas terlampir ini dan berikan langkah operasionalnya.",
    attachedFiles,
  };
}

