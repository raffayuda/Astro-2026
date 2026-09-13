"use client";

import React, { createContext, useContext, useEffect, useRef, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { toast } from "sonner";
import type { ActionProposalData } from "@/components/dashboard/AiActionCard";
import type { CsvExportData } from "@/components/dashboard/AiCsvExportCard";

const STORAGE_KEY = "astro_ai_chat_messages";

export interface AiChatContextValue {
  messages: UIMessage[];
  sendMessage: (message: { text: string }) => Promise<void>;
  status: string;
  isLoading: boolean;
  stop: () => void;
  clearChat: () => void;
  setMessages: (messages: UIMessage[] | ((prev: UIMessage[]) => UIMessage[])) => void;
}

const AiChatContext = createContext<AiChatContextValue | null>(null);

export function AiChatProvider({ children }: { children: React.ReactNode }) {
  const isInitializedRef = useRef(false);

  const {
    messages,
    sendMessage,
    status,
    stop,
    setMessages,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/dashboard/ai/chat",
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

  // 2. Persist messages to localStorage whenever they change
  useEffect(() => {
    if (!isInitializedRef.current || typeof window === "undefined") return;
    try {
      if (messages.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.warn("Gagal menyimpan riwayat chat AI:", err);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
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
 * Extracts ActionProposalData from UIMessage tool invocations
 */
export function getActionProposals(message: UIMessage): ActionProposalData[] {
  if (!message.parts || !Array.isArray(message.parts)) return [];
  const proposals: ActionProposalData[] = [];
  for (const part of message.parts as any[]) {
    const res = part.result || part.toolInvocation?.result;
    if (res && typeof res === "object" && res.type === "ACTION_PROPOSAL") {
      proposals.push(res as ActionProposalData);
    }
  }
  return proposals;
}

/**
 * Extracts CsvExportData from UIMessage tool invocations
 */
export function getCsvExports(message: UIMessage): CsvExportData[] {
  if (!message.parts || !Array.isArray(message.parts)) return [];
  const exports: CsvExportData[] = [];
  for (const part of message.parts as any[]) {
    const res = part.result || part.toolInvocation?.result;
    if (res && typeof res === "object" && res.type === "CSV_EXPORT") {
      exports.push(res as CsvExportData);
    }
  }
  return exports;
}
