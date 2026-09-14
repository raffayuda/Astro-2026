import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { toast } from "sonner";
import type { ActionProposalData } from "@/components/dashboard/AiActionCard";
import type { CsvExportData } from "@/components/dashboard/AiCsvExportCard";
import type { ParsedDocumentResult } from "@/src/server/ai/document-parser";

const STORAGE_KEY = "astro_ai_chat_messages";

export interface AiChatContextValue {
  messages: UIMessage[];
  sendMessage: (message: { text: string }) => Promise<void>;
  status: string;
  isLoading: boolean;
  stop: () => void;
  clearChat: () => void;
  setMessages: (messages: UIMessage[] | ((prev: UIMessage[]) => UIMessage[])) => void;
  attachedFiles: ParsedDocumentResult[];
  uploadAndAttachFile: (file: File) => Promise<boolean>;
  removeAttachedFile: (fileName: string) => void;
  clearAttachedFiles: () => void;
  isUploadingFile: boolean;
}

const AiChatContext = createContext<AiChatContextValue | null>(null);

export function AiChatProvider({ children }: { children: React.ReactNode }) {
  const isInitializedRef = useRef(false);
  const [attachedFiles, setAttachedFiles] = useState<ParsedDocumentResult[]>([]);
  const attachedFilesRef = useRef<ParsedDocumentResult[]>([]);
  attachedFilesRef.current = attachedFiles;
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const {
    messages,
    sendMessage: rawSendMessage,
    status,
    stop,
    setMessages,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/dashboard/ai/chat",
      body: () => ({
        attachedFiles: attachedFilesRef.current,
      }),
    }),
    onError: (err) => {
      console.error("AI Chat Error:", err);
      toast.error(err.message || "Gagal berkomunikasi dengan AI");
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  // 1. Restore chat messages from localStorage on initial mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (err) {
      console.warn("Gagal memulihkan riwayat chat AI:", err);
    } finally {
      isInitializedRef.current = true;
    }
  }, [setMessages]);

  // 2. Debounced persist messages to localStorage to avoid thread blocking during streaming
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const persistMessages = useCallback((msgs: UIMessage[]) => {
    if (typeof window === "undefined") return;
    try {
      if (msgs.length > 0) {
        // Sliding window: keep up to 50 most recent messages to prevent storage quota exhaustion and huge stringify overhead
        const toSave = msgs.length > 50 ? msgs.slice(-50) : msgs;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.warn("Gagal menyimpan riwayat chat AI:", err);
    }
  }, []);

  useEffect(() => {
    if (!isInitializedRef.current || typeof window === "undefined") return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce writes by 800ms during rapid stream chunks
    saveTimeoutRef.current = setTimeout(() => {
      persistMessages(messages);
    }, 800);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [messages, persistMessages]);

  // Flush immediately when stream is finished
  useEffect(() => {
    if (status === "ready" && isInitializedRef.current && messages.length > 0) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      persistMessages(messages);
    }
  }, [status, messages, persistMessages]);

  const uploadAndAttachFile = useCallback(async (file: File): Promise<boolean> => {
    setIsUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/dashboard/ai/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Gagal memproses berkas");
        return false;
      }
      const doc: ParsedDocumentResult = data.data;
      setAttachedFiles((prev) => {
        const filtered = prev.filter((f) => f.fileName !== doc.fileName);
        return [...filtered, doc];
      });
      toast.success(`Berkas "${file.name}" berhasil diunggah (${doc.charCount.toLocaleString()} karakter)`);
      return true;
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Gagal mengunggah berkas");
      return false;
    } finally {
      setIsUploadingFile(false);
    }
  }, []);

  const removeAttachedFile = useCallback((fileName: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.fileName !== fileName));
  }, []);

  const clearAttachedFiles = useCallback(() => {
    setAttachedFiles([]);
  }, []);

  const sendMessage = useCallback(
    async (message: { text: string }) => {
      await rawSendMessage(message);
      if (attachedFilesRef.current.length > 0) {
        setAttachedFiles([]);
      }
    },
    [rawSendMessage]
  );

  const clearChat = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setMessages([]);
    setAttachedFiles([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    toast.success("Sesi chat baru dimulai");
  }, [setMessages]);

  return (
    <AiChatContext.Provider
      value={{
        messages,
        sendMessage,
        status,
        isLoading,
        stop,
        clearChat,
        setMessages,
        attachedFiles,
        uploadAndAttachFile,
        removeAttachedFile,
        clearAttachedFiles,
        isUploadingFile,
      }}
    >
      {children}
    </AiChatContext.Provider>
  );
}

export function useAiChat(): AiChatContextValue {
  const context = useContext(AiChatContext);
  if (!context) {
    throw new Error("useAiChat must be used within an AiChatProvider");
  }
  return context;
}

/**
 * Extracts plain text from a UIMessage, supporting both .parts and fallback .content
 */
export function getMessageText(message: UIMessage): string {
  if (message.parts && Array.isArray(message.parts)) {
    const text = message.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text" && typeof (p as any).text === "string")
      .map((p) => p.text)
      .join("");
    if (text) return text;
  }
  if (typeof (message as any).content === "string") {
    return (message as any).content;
  }
  return "";
}

/**
 * Cleans raw JSON blocks from assistant text if already rendered as an Action Proposal card
 */
export function cleanDisplayAssistantText(text: string, hasProposals: boolean): string {
  if (!text) return "";
  if (!hasProposals) return text;
  return text
    .replace(/```(?:json)?\s*\{[\s\S]*?"type"\s*:\s*"ACTION_PROPOSAL"[\s\S]*?\}\s*```/gi, "")
    .replace(/\{[\s\S]*?"type"\s*:\s*"ACTION_PROPOSAL"[\s\S]*?\}/gi, "")
    .trim();
}

/**
 * Extracts ActionProposalData from UIMessage tool invocations, tool outputs, and text fallbacks
 */
export function getActionProposals(message: UIMessage): ActionProposalData[] {
  const proposals: ActionProposalData[] = [];
  const seenActionIds = new Set<string>();

  const addProposal = (obj: any) => {
    if (!obj || typeof obj !== "object") return;
    if (obj.type === "ACTION_PROPOSAL" && obj.actionType) {
      const id = obj.actionId || `${obj.actionType}-${obj.title || Date.now()}`;
      if (!seenActionIds.has(id)) {
        seenActionIds.add(id);
        proposals.push(obj as ActionProposalData);
      }
    }
  };

  const tryParseJson = (val: unknown): any => {
    if (typeof val !== "string") return val;
    try {
      const trimmed = val.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        return JSON.parse(trimmed);
      }
    } catch {
      // ignore
    }
    return val;
  };

  // 1. Inspect parts array (AI SDK 4 / 5 uses part.output)
  if (message.parts && Array.isArray(message.parts)) {
    for (const part of message.parts as any[]) {
      // Direct output in AI SDK 4/5
      addProposal(tryParseJson(part.output));
      // Legacy result in AI SDK 3
      addProposal(tryParseJson(part.result));
      // ToolInvocation wrappers
      addProposal(tryParseJson(part.toolInvocation?.output));
      addProposal(tryParseJson(part.toolInvocation?.result));
      // Data parts
      addProposal(tryParseJson(part.data));
      // In case part itself is the proposal object
      addProposal(part);

      // Fallback: If tool was called (proposeCreateCompetition) with input, synthesize proposal if output is pending
      const toolName =
        part.toolName ||
        (typeof part.type === "string" && part.type.startsWith("tool-")
          ? part.type.replace(/^tool-/, "")
          : "");

      if (
        toolName === "proposeCreateCompetition" &&
        part.input &&
        typeof part.input === "object" &&
        proposals.length === 0
      ) {
        const inp = part.input;
        addProposal({
          type: "ACTION_PROPOSAL",
          actionId: `act-create-${Date.now()}`,
          actionType: "CREATE_COMPETITION",
          title: `Tambah Lomba: ${inp.title || "Cabang Lomba Baru"}`,
          summary: `Proposal penambahan cabang lomba '${inp.title || ""}' (${inp.category || "umum"}). Silakan periksa detailnya dan tekan 'Setujui & Terapkan'.`,
          payload: {
            id: (inp.title || "lomba").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            title: inp.title,
            category: inp.category,
            tagline: inp.tagline || "",
            description: inp.description,
            fee: inp.isFree ? 0 : inp.fee || 0,
            isFree: inp.isFree ?? inp.fee === 0,
            maxSlots: inp.maxSlots || 16,
            scheduleDate: inp.scheduleDate || null,
            location: inp.location || "Kampus STT Terpadu Nurul Fikri",
            contactName: inp.contactName || null,
            contactWhatsapp: inp.contactWhatsapp || null,
            type: inp.type || "team",
            maxTeamMembers: inp.maxTeamMembers || 5,
            minTeamMembers: inp.minTeamMembers || 1,
            rulesSummary: inp.rulesSummary || null,
            prizesFirst: inp.prizesFirst || null,
            prizesSecond: inp.prizesSecond || null,
            prizesThird: inp.prizesThird || null,
            isActive: true,
          },
          preview: [
            { label: "Nama Lomba", value: inp.title },
            { label: "Kategori", value: inp.category },
            { label: "Biaya", value: inp.fee ? `Rp ${inp.fee.toLocaleString("id-ID")}` : "Gratis" },
            { label: "Kuota", value: `${inp.maxSlots || 16} Tim` },
          ],
        });
      }
    }
  }

  // 2. Inspect root toolInvocations (legacy AI SDK)
  const legacyToolInvocations = (message as any).toolInvocations;
  if (Array.isArray(legacyToolInvocations)) {
    for (const inv of legacyToolInvocations) {
      addProposal(tryParseJson(inv.output));
      addProposal(tryParseJson(inv.result));
    }
  }

  // 3. Fallback: Check text content for raw JSON containing ACTION_PROPOSAL
  if (proposals.length === 0) {
    const text = getMessageText(message);
    if (text.includes("ACTION_PROPOSAL")) {
      try {
        const match = text.match(/\{[\s\S]*?"type"\s*:\s*"ACTION_PROPOSAL"[\s\S]*?\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          addProposal(parsed);
        }
      } catch {
        // ignore
      }
    }
  }

  return proposals;
}

/**
 * Extracts CsvExportData from UIMessage tool invocations, tool outputs, and data parts
 */
export function getCsvExports(message: UIMessage): CsvExportData[] {
  const exports: CsvExportData[] = [];
  const seenIds = new Set<string>();

  const addExport = (obj: any) => {
    if (!obj || typeof obj !== "object") return;
    if (obj.type === "CSV_EXPORT" && obj.csvContent) {
      const id = obj.exportId || obj.filename || `${exports.length}`;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        exports.push(obj as CsvExportData);
      }
    }
  };

  const tryParseJson = (val: unknown): any => {
    if (typeof val !== "string") return val;
    try {
      const trimmed = val.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        return JSON.parse(trimmed);
      }
    } catch {
      // ignore
    }
    return val;
  };

  if (message.parts && Array.isArray(message.parts)) {
    for (const part of message.parts as any[]) {
      addExport(tryParseJson(part.output));
      addExport(tryParseJson(part.result));
      addExport(tryParseJson(part.toolInvocation?.output));
      addExport(tryParseJson(part.toolInvocation?.result));
      addExport(tryParseJson(part.data));
      addExport(part);
    }
  }

  const legacyToolInvocations = (message as any).toolInvocations;
  if (Array.isArray(legacyToolInvocations)) {
    for (const inv of legacyToolInvocations) {
      addExport(tryParseJson(inv.output));
      addExport(tryParseJson(inv.result));
    }
  }

  return exports;
}

