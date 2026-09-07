"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FormStep from "./FormStep";
import PaymentStep from "./PaymentStep";
import { ArrowLeft, Trophy, Lock, RotateCcw, Sparkles } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useCompetition, useRegistration } from "@/src/lib/hooks/use-queries";
import { toIsoString } from "@/lib/date";

const MotionImage = motion.create(Image);

import { getEffectiveCompetitionFee } from "@/src/lib/competitions";

import type { CompetitionCustomField } from "@/types/astro";

interface CompetitionData {
  id: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  fee: number;
  batchName?: string | null;
  hasBatches?: boolean;
  batches?: any[];
  maxSlots: number;
  filledSlots: number;
  scheduleDate: string;
  location: string;
  prizes: { label: string; value: string }[];
  rulesSummary: string[];
  rulebookUrl: string;
  registrationUrl?: string;
  contactPerson: { name: string; whatsapp: string };
  type?: string;
  maxTeamMembers?: number;
  minTeamMembers?: number;
  playerPhotoRequired?: boolean;
  isFree?: boolean;
  isActive?: boolean;
  customFields?: CompetitionCustomField[];
}

const categoryConfig: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    accent: string;
    iconBg: string;
    iconBorder: string;
  }
> = {
  akademik: {
    label: "AKADEMIK",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    accent: "bg-emerald-500",
    iconBg: "bg-emerald-50 text-emerald-600",
    iconBorder: "border-emerald-200",
  },
  olahraga: {
    label: "OLAHRAGA",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    accent: "bg-orange-500",
    iconBg: "bg-orange-50 text-orange-600",
    iconBorder: "border-orange-200",
  },
  esports: {
    label: "ESPORTS",
    color: "text-cyan-700",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    accent: "bg-cyan-500",
    iconBg: "bg-cyan-50 text-cyan-600",
    iconBorder: "border-cyan-200",
  },
  "kesenian-/-seni": {
    label: "KESENIAN",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    accent: "bg-violet-500",
    iconBg: "bg-violet-50 text-violet-600",
    iconBorder: "border-violet-200",
  },
};

export default function RegistrationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const reduce = useReducedMotion();
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [regIdFromQuery, setRegIdFromQuery] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [paymentLinkUrl, setPaymentLinkUrl] = useState<string | null>(null);
  const [paymentExpiresAt, setPaymentExpiresAt] = useState<string | null>(null);
  const [initialPaymentCode, setInitialPaymentCode] = useState<string | null>(null);
  const [initialPaymentCodeType, setInitialPaymentCodeType] = useState<string | null>(null);
  const [regType, setRegType] = useState<'team' | 'individual'>('individual');
  const [formData, setFormData] = useState({
    fullName: "",
    teamName: "",
    institution: "",
    identityNumber: "",
    leaderName: "",
    leaderIdentity: "",
    leaderPhotoUrl: "",
    email: "",
    whatsapp: "",
    members: "",
    memberDetails: [] as { name: string; photoUrl: string }[],
    customFields: {} as Record<string, any>,
  });

  const [draftRestored, setDraftRestored] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setResolvedId(p.id);
      const qRegId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("regId") : null;
      if (qRegId) {
        setRegIdFromQuery(qRegId);
      } else if (typeof window !== "undefined") {
        try {
          // Check if there is an active pending registration in localStorage
          const storedRegId = localStorage.getItem(`astro_active_reg_${p.id}`);
          if (storedRegId) {
            setRegIdFromQuery(storedRegId);
            const newUrl = `${window.location.pathname}?regId=${encodeURIComponent(storedRegId)}`;
            window.history.replaceState(null, "", newUrl);
            return;
          }

          // Otherwise restore draft form inputs if available
          const rawDraft = localStorage.getItem(`astro_reg_draft_${p.id}`);
          if (rawDraft) {
            const draft = JSON.parse(rawDraft);
            if (draft?.values) {
              setFormData((prev) => ({ ...prev, ...draft.values }));
              if (draft.regType) setRegType(draft.regType);
              setDraftRestored(true);
            }
          }
        } catch {}
      }
    });
  }, [params]);

  const handleResetDraft = () => {
    if (!resolvedId || typeof window === "undefined") return;
    try {
      localStorage.removeItem(`astro_reg_draft_${resolvedId}`);
      localStorage.removeItem(`astro_active_reg_${resolvedId}`);
    } catch {}
    setFormData({
      fullName: "",
      teamName: "",
      institution: "",
      identityNumber: "",
      leaderName: "",
      leaderIdentity: "",
      leaderPhotoUrl: "",
      email: "",
      whatsapp: "",
      members: "",
      memberDetails: [],
      customFields: {},
    });
    setDraftRestored(false);
    toast.info("Draf formulir telah direset");
  };

  const { data: c, isLoading: compLoading, isError: compError } = useCompetition(resolvedId ?? "");
  const { data: existingReg } = useRegistration(regIdFromQuery ?? "");

  // Sync the selected registration type with what the competition allows:
  // team-only -> team, individual-only -> individual, both -> user picks.
  useEffect(() => {
    if (c?.type === 'team') setRegType('team');
    else if (c?.type === 'individual') setRegType('individual');
  }, [c?.type]);

  const competition: CompetitionData | null = useMemo(() => {
    if (!c) return null;
    const isFree = Boolean(c.isFree) || (c as any).isFree === '1' || (c as any).isFree === 'true';
    const effective = getEffectiveCompetitionFee(c);
    return {
      id: c.id,
      title: c.title,
      category: c.category,
      tagline: c.tagline || "",
      description: c.description || "",
      fee: effective.fee,
      batchName: effective.batchName,
      hasBatches: c.hasBatches === true || (c as any).hasBatches === '1',
      batches: c.batches || [],
      maxSlots: c.maxSlots,
      filledSlots: c.filledSlots,
      scheduleDate: toIsoString(c.scheduleDate),
      location: c.location || "",
      prizes: c.prizes?.length
        ? c.prizes
        : [
            ...(c.prizesFirst
              ? [{ label: "Juara 1", value: c.prizesFirst }]
              : []),
            ...(c.prizesSecond
              ? [{ label: "Juara 2", value: c.prizesSecond }]
              : []),
            ...(c.prizesThird
              ? [{ label: "Juara 3", value: c.prizesThird }]
              : []),
          ],
      rulesSummary: c.rulesSummary || [],
      rulebookUrl: c.rulebookUrl || "",
      registrationUrl: "",
      contactPerson: {
        name: c.contactName || "",
        whatsapp: c.contactWhatsapp || "",
      },
      type: c.type || "individual",
      maxTeamMembers: c.maxTeamMembers || 1,
      minTeamMembers: c.minTeamMembers || 1,
      playerPhotoRequired: !!c.playerPhotoRequired,
      isFree,
      isActive: c.isActive !== undefined ? (c.isActive === true || (c.isActive as any) === '1') : true,
      customFields: (c as any).customFields || [],
    };
  }, [c]);

  useEffect(() => {
    if (!existingReg) return;
    const r = existingReg as any;
    setRegistrationId(r.id);
    setPaymentReference(r.paymentReference);
    setPaymentLinkUrl(r.paymentLinkUrl ?? null);
    setPaymentExpiresAt(r.paymentExpiresAt ?? null);
    if (r.paymentCode) {
      setInitialPaymentCode(r.paymentCode);
      setInitialPaymentCodeType(r.paymentCodeType ?? 'QR_TEXT');
    }
    setFormData({
      fullName: r.fullName || "",
      teamName: r.teamName || "",
      institution: r.institution || "",
      identityNumber: r.identityNumber || "",
      leaderName: r.leaderName || "",
      leaderIdentity: r.leaderIdentity || "",
      leaderPhotoUrl: r.leaderPhotoUrl || "",
      email: r.email || "",
      whatsapp: r.whatsapp || "",
      members: r.members || "",
      memberDetails: (r.memberDetails || []).map(
        (m: { name?: string; photoUrl?: string | null }) => ({
          name: m.name || "",
          photoUrl: m.photoUrl || "",
        }),
      ),
      customFields: r.customFields || {},
    });
    // If registration is already paid or pending payment, navigate straight to payment step (success or QRIS)
    if (r.paymentStatus === 'paid') {
      setStep(2);
      if (resolvedId && typeof window !== "undefined") {
        try {
          localStorage.removeItem(`astro_active_reg_${resolvedId}`);
          localStorage.removeItem(`astro_reg_draft_${resolvedId}`);
        } catch {}
      }
    } else if (r.paymentStatus === 'pending' && (r.paymentLinkUrl || r.paymentCode || r.paymentReference)) {
      setStep(2);
    } else {
      setStep(1);
    }
  }, [existingReg, resolvedId]);

  const fetching = compLoading || !resolvedId;
  const notFound = compError || (!fetching && !competition);

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="size-6 text-primary" />
      </div>
    );
  }

  if (notFound || !competition) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="space-y-4 text-center">
            <h1 className="text-display text-foreground">404</h1>
            <p className="text-muted-foreground">Lomba tidak ditemukan.</p>
            <Button asChild className="clip-angled text-xs font-black uppercase tracking-wider">
              <Link href="/#competitions">
                <ArrowLeft data-icon="inline-start" /> Kembali ke Lomba
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (competition.isActive === false) {
    return (
      <>
        <Navbar />
        <div className="astro-sky-soft astro-bubble-field min-h-screen flex items-center justify-center px-4 py-20">
          <div className="astro-card p-8 sm:p-12 max-w-lg w-full text-center space-y-6">
            <div className="size-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto ring-8 ring-red-50">
              <Lock className="size-8" />
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="clip-angled-sm border-red-200 bg-red-50 text-[10px] font-bold uppercase tracking-wider text-red-600">
                Pendaftaran Ditutup
              </Badge>
              <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
                {competition.title}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Mohon maaf, pendaftaran untuk kompetisi ini sedang tidak dibuka atau telah berakhir.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button asChild variant="outline" className="clip-angled text-xs font-bold uppercase tracking-wider flex-1">
                <Link href={`/competitions/${competition.id}`}>
                  Detail Lomba
                </Link>
              </Button>
              <Button asChild className="clip-angled text-xs font-bold uppercase tracking-wider flex-1">
                <Link href="/#competitions">
                  <ArrowLeft data-icon="inline-start" /> Lomba Lainnya
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const cat = categoryConfig[competition.category] || categoryConfig.akademik;
  // 'both' lets the participant choose; otherwise follow the competition type.
  const isTeam = competition.type === 'both' ? regType === 'team' : competition.type === "team";
  const canChooseType = competition.type === 'both';

  const handleFormSubmit = (
    regId: string,
    ref: string,
    linkUrl?: string | null,
    expiresAt?: string | null,
    paymentCode?: string | null,
    paymentCodeType?: string | null,
  ) => {
    setRegistrationId(regId);
    setPaymentReference(ref);
    setPaymentLinkUrl(linkUrl ?? null);
    setPaymentExpiresAt(expiresAt ?? null);
    setInitialPaymentCode(paymentCode ?? null);
    setInitialPaymentCodeType(paymentCodeType ?? null);
    setStep(2);
    if (resolvedId && typeof window !== "undefined") {
      try {
        localStorage.setItem(`astro_active_reg_${resolvedId}`, regId);
        const newUrl = `${window.location.pathname}?regId=${encodeURIComponent(regId)}`;
        window.history.replaceState(null, "", newUrl);
      } catch {}
    }
  };

  const handleBackToForm = () => {
    setStep(1);
    setRegistrationId(null);
    setPaymentReference(null);
    setPaymentLinkUrl(null);
    setPaymentExpiresAt(null);
    setInitialPaymentCode(null);
    setInitialPaymentCodeType(null);
    setRegIdFromQuery(null);
    if (resolvedId && typeof window !== "undefined") {
      try {
        localStorage.removeItem(`astro_active_reg_${resolvedId}`);
        window.history.replaceState(null, "", window.location.pathname);
      } catch {}
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const stepVariants = {
    enter: { opacity: 0, y: 30 },
    center: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
    },
    exit: {
      opacity: 0,
      y: -30,
      transition: { duration: 0.25, ease: "easeIn" as const },
    },
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex flex-col justify-between astro-sky-soft">
        <main className="flex-grow">
          {/* ─── HEADER ─── */}
          <section className="astro-sky astro-frame-y astro-bubble-field relative overflow-hidden pt-36 pb-14 md:pt-40 md:pb-18">
            <div className="astro-pattern absolute inset-0 z-0 opacity-35" />
            {/* ─── SKY BACKGROUND ─── */}
            <div className="absolute inset-0 -z-10 " />

            {/* ─── FLOATING BLOBS ─── */}
            {[
              {
                src: "/assets/blob-round.png",
                w: 80,
                h: 80,
                className:
                  "absolute top-[6%] -left-[2%] w-12 h-12 md:w-28 md:h-28 object-contain pointer-events-none select-none z-0",
                dur: 7,
                delay: 0,
              },
              {
                src: "/assets/blob-round.png",
                w: 72,
                h: 72,
                className:
                  "absolute top-[12%] -right-[2%] w-10 h-10 md:w-24 md:h-24 object-contain pointer-events-none select-none z-0",
                dur: 9,
                delay: 0.15,
              },
              {
                src: "/assets/blob-round.png",
                w: 64,
                h: 64,
                className:
                  "absolute bottom-[18%] left-[4%] w-8 h-8 md:w-20 md:h-20 object-contain pointer-events-none select-none z-0",
                dur: 6,
                delay: 0.3,
              },
              {
                src: "/assets/blob-round.png",
                w: 96,
                h: 96,
                className:
                  "absolute bottom-[8%] right-[3%] w-12 h-12 md:w-32 md:h-32 object-contain pointer-events-none select-none z-0",
                dur: 10,
                delay: 0.1,
              },
            ].map((b, i) => (
              <MotionImage
                key={`blob-${i}`}
                src={b.src}
                alt=""
                width={b.w}
                height={b.h}
                animate={reduce ? undefined : { y: [0, -14, 0] }}
                transition={{
                  duration: b.dur,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: b.delay,
                }}
                className={b.className}
              />
            ))}

            {/* ─── FLOATING CLOUDS ─── */}
            <MotionImage
              src="/assets/awan1.png"
              alt=""
              width={160}
              height={120}
              animate={reduce ? undefined : { x: [0, 15, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[10%] left-[2%] w-16 h-auto md:w-40 md:h-auto object-contain pointer-events-none select-none z-0 opacity-40"
            />
            <MotionImage
              src="/assets/awan2.png"
              alt=""
              width={200}
              height={140}
              animate={reduce ? undefined : { x: [0, -12, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[30%] right-[3%] w-20 h-auto md:w-48 md:h-auto object-contain pointer-events-none select-none z-0 opacity-35"
            />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Back link */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="mb-6"
              >
                <Button asChild variant="link" className="mb-6 gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary">
                  <Link href={`/competitions/${competition.id}`}>
                    <ArrowLeft data-icon="inline-start" /> Kembali ke Detail Lomba
                  </Link>
                </Button>
              </motion.div>

              {/* Category badge */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="mb-4"
              >
                <Badge
                  variant="outline"
                  className={`clip-angled-sm border px-3 py-1.5 text-[10px] font-bold tracking-[0.15em] uppercase ${cat.bg} ${cat.color} ${cat.border}`}
                >
                  {cat.label}
                </Badge>
              </motion.div>

              <motion.h1
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="astro-title-chrome text-xl md:text-3xl font-black uppercase tracking-tight mb-2"
              >
                Pendaftaran {competition.title}
              </motion.h1>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="accent-line mb-4"
              />

              <motion.p
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="astro-pill flex w-fit items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[#18345f]"
              >
                <Trophy className="w-4 h-4 text-astro-cyan" />
                Biaya Pendaftaran:{" "}
                <span className="font-bold text-slate-900">
                  {competition.isFree ? "Gratis" : competition.fee > 0 ? `Rp ${competition.fee.toLocaleString("id-ID")}` : "Gratis"}
                </span>
                {competition.batchName && (
                  <span className="ml-1.5 inline-flex items-center rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-cyan-800">
                    {competition.batchName}
                  </span>
                )}
                <span className="text-slate-300 mx-1">|</span>
                {isTeam ? "Kategori Tim" : "Kategori Individu"}
              </motion.p>

              {/* Pilihan Kategori (hanya untuk lomba yang menerima individu & tim) */}
              {canChooseType && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="mt-6 flex flex-wrap items-center gap-3"
                >
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Pilih Kategori Pendaftaran:
                  </span>
                  <div className="astro-pill flex overflow-hidden border-white/80 bg-white/75">
                    {(['individual', 'team'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setRegType(t);
                          setFormData((prev) => ({
                            ...prev,
                            fullName: "",
                            identityNumber: "",
                            teamName: "",
                            leaderName: "",
                            leaderIdentity: "",
                            leaderPhotoUrl: "",
                            members: "",
                            memberDetails: [],
                          }));
                        }}
                        className={`px-5 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                          regType === t
                            ? "bg-astro-cyan text-slate-950"
                            : "text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {t === 'team' ? 'Tim' : 'Individu'}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ─── STEP INDICATOR ─── */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="mt-8 flex items-center gap-0"
              >
                {/* Step 1 */}
                <div className="flex items-center">
                  <motion.div
                    animate={step === 1 ? { scale: 1.05 } : { scale: 1 }}
                    className={`flex items-center justify-center w-10 h-10 ${
                      step === 1
                        ? "bg-astro-cyan text-slate-950"
                        : "bg-slate-100 text-slate-500"
                    } font-black text-sm transition-all duration-300`}
                    style={{
                      clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)",
                    }}
                  >
                    1
                  </motion.div>
                  <span
                    className={`ml-2 text-[10px] font-bold uppercase tracking-wider ${
                      step === 1 ? "text-astro-cyan" : "text-slate-400"
                    }`}
                  >
                    Form
                  </span>
                </div>

                {/* Connector line */}
                <div className="w-12 md:w-20 h-[2px] mx-3 relative">
                  <div className="absolute inset-0 bg-slate-200" />
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-astro-cyan"
                    initial={{ width: "0%" }}
                    animate={{ width: step === 2 ? "100%" : "0%" }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>

                {/* Step 2 */}
                <div className="flex items-center">
                  <motion.div
                    animate={step === 2 ? { scale: 1.05 } : { scale: 1 }}
                    className={`flex items-center justify-center w-10 h-10 ${
                      step === 2
                        ? "bg-astro-cyan text-slate-950"
                        : "bg-slate-100 text-slate-500"
                    } font-black text-sm transition-all duration-300`}
                    style={{
                      clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)",
                    }}
                  >
                    2
                  </motion.div>
                  <span
                    className={`ml-2 text-[10px] font-bold uppercase tracking-wider ${
                      step === 2 ? "text-astro-cyan" : "text-slate-400"
                    }`}
                  >
                    Bayar
                  </span>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ─── CONTENT ─── */}
          <section className="astro-sky-soft relative overflow-hidden pb-20 md:pb-28">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="form-step"
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    {draftRestored && !registrationId && (
                      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-200 bg-cyan-50/80 px-4 py-3 text-sm text-cyan-900 shadow-sm backdrop-blur-sm">
                        <div className="flex items-center gap-2.5">
                          <Sparkles className="size-4 text-cyan-600 shrink-0" />
                          <span>
                            <strong>Draf formulir dipulihkan.</strong> Data input terakhir Anda telah dimuat kembali otomatis.
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleResetDraft}
                          className="h-7 text-xs font-bold text-cyan-800 hover:bg-cyan-100 hover:text-cyan-900 gap-1.5"
                        >
                          <RotateCcw className="size-3" />
                          Reset Formulir
                        </Button>
                      </div>
                    )}
                    <FormStep
                      // Remount once an existing registration is hydrated or draft is restored
                      // so the form picks up the prefilled values (incl. player photos).
                      key={registrationId ? `reg-${registrationId}` : draftRestored ? "draft-restored" : "new"}
                      competition={competition as any}
                      isTeam={isTeam}
                      regType={regType}
                      formData={formData}
                      setFormData={setFormData}
                      onContinue={handleFormSubmit}
                      existingRegId={existingReg && (existingReg as any).paymentStatus === 'paid' ? null : registrationId}
                      existingRef={paymentReference}
                      existingPaymentLinkUrl={paymentLinkUrl}
                      existingPaymentExpiresAt={paymentExpiresAt}
                      maxTeamMembers={competition.maxTeamMembers || 5}
                      minTeamMembers={competition.minTeamMembers || 1}
                      photoRequired={!!competition.playerPhotoRequired}
                      customFields={competition.customFields || []}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="payment-step"
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    <PaymentStep
                      competition={competition as any}
                      registrationId={registrationId || ""}
                      paymentReference={paymentReference || ""}
                      paymentLinkUrl={paymentLinkUrl}
                      paymentExpiresAt={paymentExpiresAt}
                      initialPaymentCode={initialPaymentCode}
                      initialPaymentCodeType={initialPaymentCodeType}
                      onBack={handleBackToForm}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
