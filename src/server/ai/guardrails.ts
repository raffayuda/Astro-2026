import { createUIMessageStream, createUIMessageStreamResponse } from "ai";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ASTRO COPILOT HIGH-END AI GUARDRAILS ENGINE
 * ─────────────────────────────────────────────────────────────────────────────
 * Multi-layer security, anti-jailbreak, anti-abuse, rate limiting, and governance
 * for ASTRO 2026 Admin Copilot.
 */

export const MAX_INPUT_CHARS = 2500;
export const MAX_REQUESTS_PER_MINUTE = 15;
export const CIRCUIT_BREAKER_STRIKES_LIMIT = 3;
export const CIRCUIT_BREAKER_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

// In-Memory Telemetry & Security State
interface UserSecurityState {
  requestTimestamps: number[];
  strikeTimestamps: number[];
  circuitBrokenUntil: number | null;
}

interface SecurityTelemetryStats {
  totalRequestsChecked: number;
  totalThreatsBlocked: number;
  threatsByType: Record<string, number>;
  circuitBreakerTrips: number;
  activeGuards: string[];
}

const userSecurityStore = new Map<string, UserSecurityState>();

const telemetryStats: SecurityTelemetryStats = {
  totalRequestsChecked: 0,
  totalThreatsBlocked: 0,
  threatsByType: {
    ARBITRARY_CODING: 0,
    PROMPT_INJECTION_OR_JAILBREAK: 0,
    PROMPT_EXFILTRATION: 0,
    OBFUSCATION_CIPHER: 0,
    PAYLOAD_TOO_LARGE: 0,
    RATE_LIMIT_EXCEEDED: 0,
    CIRCUIT_BREAKER_ACTIVE: 0,
  },
  circuitBreakerTrips: 0,
  activeGuards: [
    "Unicode NFKC & Homoglyph Normalizer",
    "Zero-Width & Invisible Char Stripper",
    "Payload Length Limiter (Max 2500 chars)",
    "Rate Limiter (15 req/min)",
    "Circuit Breaker (3-Strike 5-min Lockout)",
    "Heuristic Threat Classifier (Jailbreak, DAN, Prompt Theft)",
    "Arbitrary Coding & General Abuse Blocker",
    "Obfuscation & Cipher Payload Detector",
    "Indirect Prompt Injection Delimiter Isolation",
    "Zero Direct DB Writes (Human-in-the-Loop Enforcer)",
    "Output Secret & Credential Masker",
  ],
};

/**
 * Layer 1: Input Normalization & Anti-Evasion
 * Normalizes unicode, strips zero-width spaces, and collapses whitespace tricks.
 */
export function normalizeInput(rawText: string): string {
  if (!rawText) return "";

  return (
    rawText
      // 1. Unicode NFKC Normalization (transforms lookalikes & fullwidth to standard ASCII/Latin)
      .normalize("NFKC")
      // 2. Strip zero-width and invisible formatting characters
      // \u200B (Zero-width space), \u200C (ZWNJ), \u200D (ZWJ), \uFEFF (BOM), \u00A0 (NBSP), \u200E-\u200F (LTR/RTL marks)
      .replace(/[\u200B-\u200D\uFEFF\u00A0\u200E\u200F\u202A-\u202E]/g, "")
      // 3. Normalize multiple whitespaces and tabs to single spaces
      .replace(/[ \t]+/g, " ")
      // 4. Limit excessive consecutive newlines to maximum 2
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/**
 * Layer 2: Rate Limiting & Circuit Breaker Check
 */
export function checkRateLimitAndCircuitBreaker(userId: string): {
  allowed: boolean;
  reason?: "CIRCUIT_BREAKER_ACTIVE" | "RATE_LIMIT_EXCEEDED";
  retryAfterSeconds?: number;
  message?: string;
} {
  const now = Date.now();
  telemetryStats.totalRequestsChecked += 1;

  let state = userSecurityStore.get(userId);
  if (!state) {
    state = {
      requestTimestamps: [],
      strikeTimestamps: [],
      circuitBrokenUntil: null,
    };
    userSecurityStore.set(userId, state);
  }

  // Check circuit breaker
  if (state.circuitBrokenUntil && state.circuitBrokenUntil > now) {
    const remainingSeconds = Math.ceil((state.circuitBrokenUntil - now) / 1000);
    telemetryStats.threatsByType.CIRCUIT_BREAKER_ACTIVE =
      (telemetryStats.threatsByType.CIRCUIT_BREAKER_ACTIVE || 0) + 1;
    return {
      allowed: false,
      reason: "CIRCUIT_BREAKER_ACTIVE",
      retryAfterSeconds: remainingSeconds,
      message: `Sesi AI Anda dibekukan sementara selama ${Math.ceil(
        remainingSeconds / 60,
      )} menit karena terdeteksi percobaan pelanggaran keamanan berulang kali. Silakan hubungi Superadmin jika ini adalah kekeliruan.`,
    };
  } else if (state.circuitBrokenUntil && state.circuitBrokenUntil <= now) {
    // Reset circuit breaker after cooldown expires
    state.circuitBrokenUntil = null;
    state.strikeTimestamps = [];
  }

  // Clean old requests (> 60 seconds ago)
  state.requestTimestamps = state.requestTimestamps.filter((ts) => now - ts < 60 * 1000);

  if (state.requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    telemetryStats.threatsByType.RATE_LIMIT_EXCEEDED =
      (telemetryStats.threatsByType.RATE_LIMIT_EXCEEDED || 0) + 1;
    return {
      allowed: false,
      reason: "RATE_LIMIT_EXCEEDED",
      retryAfterSeconds: 60,
      message:
        "Terlalu banyak permintaan dalam waktu singkat (maksimal 15 permintaan/menit). Mohon jeda beberapa detik sebelum mengirim pesan kembali.",
    };
  }

  state.requestTimestamps.push(now);
  return { allowed: true };
}

/**
 * Record a hard security violation strike.
 * If strikes exceed CIRCUIT_BREAKER_STRIKES_LIMIT within 5 mins, triggers lockout.
 */
export function recordSecurityStrike(userId: string, violationType: string) {
  const now = Date.now();
  telemetryStats.totalThreatsBlocked += 1;
  telemetryStats.threatsByType[violationType] = (telemetryStats.threatsByType[violationType] || 0) + 1;

  let state = userSecurityStore.get(userId);
  if (!state) {
    state = {
      requestTimestamps: [],
      strikeTimestamps: [],
      circuitBrokenUntil: null,
    };
    userSecurityStore.set(userId, state);
  }

  // Keep strikes within last 5 minutes
  state.strikeTimestamps = state.strikeTimestamps.filter((ts) => now - ts < CIRCUIT_BREAKER_COOLDOWN_MS);
  state.strikeTimestamps.push(now);

  if (state.strikeTimestamps.length >= CIRCUIT_BREAKER_STRIKES_LIMIT) {
    state.circuitBrokenUntil = now + CIRCUIT_BREAKER_COOLDOWN_MS;
    telemetryStats.circuitBreakerTrips += 1;
    console.warn(`[SECURITY ALERT] Circuit breaker tripped for user: ${userId} (${violationType})`);
  }
}

export interface ThreatCheckResult {
  isThreat: boolean;
  threatType?: string;
  reason?: string;
  refusalMessage?: string;
}

/**
 * Layer 3: Deterministic Pre-Execution Threat Classifier
 * Catches jailbreaks, arbitrary coding requests, prompt theft, and cipher payloads.
 */
export function classifyThreat(normalizedText: string): ThreatCheckResult {
  if (!normalizedText) {
    return { isThreat: false };
  }

  // 1. Check Payload Length
  if (normalizedText.length > MAX_INPUT_CHARS) {
    return {
      isThreat: true,
      threatType: "PAYLOAD_TOO_LARGE",
      reason: "Input exceeds maximum character limit (2500 chars)",
      refusalMessage:
        "Pesan Anda melebihi batas maksimal 2.500 karakter. Mohon persingkat pertanyaan atau dokumen juknis yang ingin dianalisis.",
    };
  }

  const lower = normalizedText.toLowerCase();

  // 2. Prompt Injection & Jailbreak Heuristics
  const jailbreakPatterns = [
    /\b(?:ignore|disregard|forget|abaikan|lupakan)\s+(?:all\s+|semua\s+)?(?:previous|prior|awal|sebelumnya)\s+(?:instructions|prompts|rules|directives|instruksi|aturan|perintah)\b/i,
    /\b(?:system\s+override|developer\s+mode|dan\s+mode|jailbreak|unrestricted\s+mode|god\s+mode|bypass\s+safety|bypass\s+filter|mode\s+pengembang)\b/i,
    /\b(?:you\s+are\s+now|sekarang\s+kamu\s+adalah)\s+(?:an?\s+)?(?:unrestricted|bebas\s+aturan|dan|tanpa\s+batasan|evil|hacker)\b/i,
    /\b(?:pretend|berpura-pura|simulasikan|imagine)\s+(?:you\s+have\s+no\s+rules|kamu\s+tidak\s+punya\s+aturan|bebas\s+dari\s+etika|tanpa\s+pedoman)\b/i,
    /\b(?:bypass|matikan|nonaktifkan)\s+(?:filter|keamanan|guardrail|sensor|aturan)\b/i,
    /\b(?:root\s+access|sudo\s+mode|override\s+directive)\b/i,
  ];

  for (const pattern of jailbreakPatterns) {
    if (pattern.test(lower)) {
      return {
        isThreat: true,
        threatType: "PROMPT_INJECTION_OR_JAILBREAK",
        reason: "Detected prompt injection or jailbreak override attempt",
        refusalMessage:
          "Maaf, sebagai ASTRO Copilot, instruksi dan pedoman keamanan operasional saya bersifat permanen dan tidak dapat diubah atau diabaikan. Saya hanya melayani kebutuhan operasional kepanitiaan ASTRO 2026.",
      };
    }
  }

  // 3. System Prompt Exfiltration & Canary Theft
  const exfiltrationPatterns = [
    /\b(?:tampilkan|output|print|show|tuliskan|sebutkan|bocorkan|reveal)\s+(?:seluruh\s+|semua\s+)?(?:system\s+prompt|instruksi\s+sistem|prompt\s+awal|initial\s+instructions|aturan\s+internal|system\s+message)\b/i,
    /\b(?:repeat|ulangi)\s+(?:the\s+words?\s+above|kata-kata\s+di\s+atas|kalimat\s+sebelumnya)\s+(?:verbatim|persis|kata\s+demi\s+kata)\b/i,
    /\b(?:what\s+(?:are|were)\s+your\s+(?:system\s+)?instructions|apa\s+saja\s+instruksi\s+(?:sistem\s+)?kamu)\b/i,
    /\b(?:print\s+rules|output\s+rules|show\s+prompt|dump\s+prompt)\b/i,
  ];

  for (const pattern of exfiltrationPatterns) {
    if (pattern.test(lower)) {
      return {
        isThreat: true,
        threatType: "PROMPT_EXFILTRATION",
        reason: "Detected system prompt exfiltration attempt",
        refusalMessage:
          "Maaf, demi integritas dan keamanan sistem, konfigurasi instruksi internal dan system prompt ASTRO Copilot bersifat rahasia dan tidak dapat dipublikasikan. Ada yang bisa saya bantu terkait operasional lomba atau pendaftaran ASTRO 2026?",
      };
    }
  }

  // 4. Obfuscated Payloads & Ciphers (Base64, Hex, ROT13)
  const isCipherRequest =
    /\b(?:decode|dekode|pecahkan|terjemahkan|execute)\s+(?:this\s+|teks\s+)?(?:base64|hex|rot13|cipher|sandi|enkripsi)\b/i.test(
      lower,
    ) ||
    // Long Base64 string block (>= 40 alphanumeric characters with padding)
    /\b[A-Za-z0-9+/]{40,}={0,2}\b/.test(normalizedText);

  if (isCipherRequest) {
    return {
      isThreat: true,
      threatType: "OBFUSCATION_CIPHER",
      reason: "Detected obfuscated cipher or base64 decoding request",
      refusalMessage:
        "Maaf, ASTRO Copilot tidak memproses teks terenkripsi, cipher, atau string berkode Base64/Hex. Mohon sampaikan pertanyaan langsung dalam Bahasa Indonesia terkait kepanitiaan ASTRO 2026.",
    };
  }

  // 5. Arbitrary Coding & General Out-of-Domain Software Engineering
  // We exclude legitimate operational queries like "ekspor data pendaftar csv", "proposal lomba", "juknis"
  const isAstroOperationalQuery =
    lower.includes("lomba") ||
    lower.includes("pendaftar") ||
    lower.includes("peserta") ||
    lower.includes("kuota") ||
    lower.includes("biaya") ||
    lower.includes("bayar") ||
    lower.includes("laporan eksekutif") ||
    lower.includes("ekspor csv") ||
    lower.includes("juara") ||
    lower.includes("jadwal");

  const arbitraryCodingPatterns = [
    // buatkan/bikin code/kode [language] (e.g. buatkan code python, bikin script js)
    /\b(?:buatkan|tuliskan|bikin|generate|create|write)\s+(?:sebuah\s+)?(?:code|kode|kodingan|script|skrip|program|aplikasi|app|bot|scraper|fungsi|function|algoritma|algorithm|class|library)?\s*(?:dalam\s+|pake\s+|pakai\s+|menggunakan\s+|using\s+|in\s+)?(?:python|javascript|typescript|js|ts|c\+\+|cpp|c#|java|php|golang|go|rust|ruby|swift|kotlin|bash|shell|sh|html|css|sql|solidity|react|vue|nextjs|node)\b/i,
    // buatkan code / bikin script (standalone general coding request)
    /\b(?:buatkan|tuliskan|bikin|generate|create|write)\s+(?:saya\s+)?(?:code|kode|kodingan|script|skrip|program|aplikasi|app|bot|scraper|crawler)\b/i,
    // buatkan bot / scraper / malware / exploit
    /\b(?:buatkan|tuliskan|bikin|generate|code|script)\s+(?:saya\s+)?(?:bot\s+discord|bot\s+telegram|bot\s+whatsapp|bot\s+scraping|game|crawler|keylogger|malware|exploit|backdoor|phishing)\b/i,
    // kerjakan tugas coding / leetcode
    /\b(?:solve|selesaikan|kerjakan)\s+(?:tugas|pr|coding|leetcode|hackerrank|soal\s+pemrograman)\b/i,
    // Hacking & cyber attacks
    /\b(?:sql\s+injection|xss\s+payload|ddos|exploit|metasploit|hack\s+website|bypass\s+auth|crack\s+password)\b/i,
  ];

  for (const pattern of arbitraryCodingPatterns) {
    if (pattern.test(lower) && !isAstroOperationalQuery) {
      return {
        isThreat: true,
        threatType: "ARBITRARY_CODING",
        reason: "Detected arbitrary software coding or hacking request",
        refusalMessage:
          "Maaf, sebagai ASTRO Copilot, wewenang saya dibatasi secara ketat hanya untuk urusan operasional kepanitiaan ASTRO 2026 (data pendaftar, cabang lomba, verifikasi pembayaran, laporan audit eksekutif, dan ekspor CSV). Saya bukan asisten pemrograman umum dan dilarang membuat kode program, skrip perangkat lunak, atau bot.",
      };
    }
  }

  return { isThreat: false };
}

/**
 * Creates an instantaneous UI Message Stream Response (< 15ms)
 * Completely compatible with @ai-sdk/react useChat transport without touching the LLM.
 */
export function createFastRefusalStream(refusalMessage: string): Response {
  const stream = createUIMessageStream({
    execute({ writer }) {
      const partId = `guard-${Date.now()}`;
      writer.write({ type: "start" });
      writer.write({ type: "text-start", id: partId });
      writer.write({ type: "text-delta", id: partId, delta: refusalMessage });
      writer.write({ type: "text-end", id: partId });
      writer.write({ type: "finish" });
    },
  });

  return createUIMessageStreamResponse({ stream });
}

/**
 * Layer 7: Output Secret & Credential Sanitizer
 * Scrubs API keys, database connection strings, and private credentials from model responses.
 */
export function maskSensitiveSecrets(text: string): string {
  if (!text) return "";

  return text
    .replace(/9r-[A-Za-z0-9_-]{20,}/gi, "[NINEROUTER_API_KEY_MASKED]")
    .replace(/sk-[A-Za-z0-9_-]{20,}/gi, "[OPENAI_API_KEY_MASKED]")
    .replace(/postgres(?:ql)?:\/\/[^\s"'<>]+/gi, "[DATABASE_URL_MASKED]");
}

/**
 * Layer 8: Telemetry Data Getter
 */
export function getSecurityTelemetry(): SecurityTelemetryStats {
  return {
    ...telemetryStats,
    activeGuards: [...telemetryStats.activeGuards],
    threatsByType: { ...telemetryStats.threatsByType },
  };
}
