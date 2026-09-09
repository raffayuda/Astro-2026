"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Link from "next/link";
import {
  CtaButton,
  PageShell,
  Pill,
  SectionHeading,
  SectionShell,
  Surface,
  WindowCard,
  type PillProps,
} from "@/components/brand";
import FormStep from "./FormStep";
import PaymentStep from "./PaymentStep";
import { ArrowLeft, Check, FileText, CreditCard, UserRound, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useCompetition, useRegistration } from "@/src/lib/hooks/use-queries";
import { toPublicCompetition } from "@/lib/mappers";
import type { RegistrationFormValues } from "@/src/lib/forms/registration";

const CATEGORY_PILL: Record<string, { label: string; tone: NonNullable<PillProps["tone"]> }> = {
  akademik: { label: "Akademik", tone: "blue" },
  olahraga: { label: "Olahraga", tone: "orange" },
  esports: { label: "Esports", tone: "navy" },
  "kesenian-/-seni": { label: "Kesenian", tone: "pink" },
};

const EASE = [0.16, 1, 0.3, 1] as const;

const EMPTY_FORM: RegistrationFormValues = {
  fullName: "",
  teamName: "",
  institution: "",
  identityNumber: "",
  leaderName: "",
  leaderIdentity: "",
  leaderGameId: "",
  leaderPhotoUrl: "",
  email: "",
  whatsapp: "",
  members: "",
  memberDetails: [],
  customFields: {},
};

type ExistingReg = {
  id: string;
  paymentReference?: string | null;
  paymentLinkUrl?: string | null;
  paymentExpiresAt?: string | null;
  paymentCode?: string | null;
  paymentCodeType?: string | null;
  paymentStatus?: string;
  fullName?: string | null;
  teamName?: string | null;
  institution?: string | null;
  identityNumber?: string | null;
  leaderName?: string | null;
  leaderIdentity?: string | null;
  leaderGameId?: string | null;
  leaderPhotoUrl?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  members?: string | null;
  memberDetails?:
    | {
        name?: string;
        gameId?: string | null;
        photoUrl?: string | null;
      }[]
    | null;
  customFields?: Record<string, unknown> | null;
};

export default function RegistrationPage({ params }: { params: Promise<{ id: string }> }) {
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
  const [regType, setRegType] = useState<"team" | "individual">("individual");
  const [formData, setFormData] = useState<RegistrationFormValues>(EMPTY_FORM);
  const [draftRestored, setDraftRestored] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setResolvedId(p.id);
      const qRegId =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("regId")
          : null;
      if (qRegId) {
        setRegIdFromQuery(qRegId);
      } else if (typeof window !== "undefined") {
        try {
          const storedRegId = localStorage.getItem(`astro_active_reg_${p.id}`);
          if (storedRegId) {
            setRegIdFromQuery(storedRegId);
            const newUrl = `${window.location.pathname}?regId=${encodeURIComponent(storedRegId)}`;
            window.history.replaceState(null, "", newUrl);
            return;
          }

          const rawDraft = localStorage.getItem(`astro_reg_draft_${p.id}`);
          if (rawDraft) {
            const draft = JSON.parse(rawDraft) as {
              values?: RegistrationFormValues;
              regType?: "team" | "individual";
            };
            if (draft?.values) {
              setFormData((prev) => ({ ...prev, ...draft.values }));
              if (draft.regType) setRegType(draft.regType);
              setDraftRestored(true);
            }
          }
        } catch {
          /* ignore corrupt draft */
        }
      }
    });
  }, [params]);

  const handleResetDraft = () => {
    if (!resolvedId || typeof window === "undefined") return;
    try {
      localStorage.removeItem(`astro_reg_draft_${resolvedId}`);
      localStorage.removeItem(`astro_active_reg_${resolvedId}`);
    } catch {
      /* ignore */
    }
    setFormData(EMPTY_FORM);
    setDraftRestored(false);
    toast.info("Draf formulir telah direset");
  };

  const { data: c, isLoading: compLoading, isError: compError } = useCompetition(resolvedId ?? "");
  const { data: existingRegRaw } = useRegistration(regIdFromQuery ?? "");
  const existingReg = existingRegRaw as ExistingReg | undefined;

  useEffect(() => {
    if (c?.type === "team") setRegType("team");
    else if (c?.type === "individual") setRegType("individual");
  }, [c?.type]);

  const competition = useMemo(() => (c ? toPublicCompetition(c) : null), [c]);

  useEffect(() => {
    if (!existingReg) return;
    setRegistrationId(existingReg.id);
    setPaymentReference(existingReg.paymentReference ?? null);
    setPaymentLinkUrl(existingReg.paymentLinkUrl ?? null);
    setPaymentExpiresAt(existingReg.paymentExpiresAt ?? null);
    if (existingReg.paymentCode) {
      setInitialPaymentCode(existingReg.paymentCode);
      setInitialPaymentCodeType(existingReg.paymentCodeType ?? "QR_TEXT");
    }
    setFormData({
      fullName: existingReg.fullName || "",
      teamName: existingReg.teamName || "",
      institution: existingReg.institution || "",
      identityNumber: existingReg.identityNumber || "",
      leaderName: existingReg.leaderName || "",
      leaderIdentity: existingReg.leaderIdentity || "",
      leaderGameId: existingReg.leaderGameId || "",
      leaderPhotoUrl: existingReg.leaderPhotoUrl || "",
      email: existingReg.email || "",
      whatsapp: existingReg.whatsapp || "",
      members: existingReg.members || "",
      memberDetails: (existingReg.memberDetails || []).map((member) => ({
        name: member.name || "",
        gameId: member.gameId || "",
        photoUrl: member.photoUrl || "",
      })),
      customFields: (existingReg.customFields ?? {}) as Record<string, string>,
    });
    if (existingReg.paymentStatus === "paid") {
      setStep(2);
      if (resolvedId && typeof window !== "undefined") {
        try {
          localStorage.removeItem(`astro_active_reg_${resolvedId}`);
          localStorage.removeItem(`astro_reg_draft_${resolvedId}`);
        } catch {
          /* ignore */
        }
      }
    } else if (
      existingReg.paymentStatus === "pending" &&
      (existingReg.paymentLinkUrl || existingReg.paymentCode || existingReg.paymentReference)
    ) {
      setStep(2);
    } else {
      setStep(1);
    }
  }, [existingReg, resolvedId]);

  const fetching = compLoading || !resolvedId;
  const missing = compError || (!fetching && !competition);

  if (fetching) {
    return (
      <PageShell>
        <div className="flex min-h-[60svh] items-center justify-center">
          <Spinner className="size-6 text-astro-navy" />
        </div>
      </PageShell>
    );
  }

  if (missing || !competition) {
    return (
      <PageShell>
        <SectionShell space="lg" className="pt-24">
          <Surface tone="plain" radius="2xl" pad="xl" className="mx-auto max-w-md text-center">
            <h1 className="font-heading text-2xl font-black text-astro-navy">
              Lomba tidak ditemukan
            </h1>
            <p className="mt-2 text-sm text-ink/70">Cabang ini tidak ada atau sudah dihapus.</p>
            <CtaButton href="/#competitions" size="default" className="mt-6" showChevron={false}>
              Lihat lomba
            </CtaButton>
          </Surface>
        </SectionShell>
      </PageShell>
    );
  }

  if (competition.isActive === false) {
    return (
      <PageShell>
        <SectionShell space="lg" className="pt-24">
          <WindowCard title="Pendaftaran" className="mx-auto max-w-lg">
            <Pill tone="pink" size="sm">
              Ditutup
            </Pill>
            <h1 className="mt-3 font-heading text-2xl font-black text-astro-navy">
              {competition.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink/75">
              Pendaftaran untuk lomba ini sedang tidak dibuka.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" className="flex-1 rounded-full">
                <Link href={`/competitions/${competition.id}`}>Detail lomba</Link>
              </Button>
              <CtaButton
                href="/#competitions"
                size="default"
                className="flex-1"
                showChevron={false}
              >
                Lomba lain
              </CtaButton>
            </div>
          </WindowCard>
        </SectionShell>
      </PageShell>
    );
  }

  const category = CATEGORY_PILL[competition.category] ?? CATEGORY_PILL.akademik;
  const isTeam = competition.type === "both" ? regType === "team" : competition.type === "team";
  const canChooseType = competition.type === "both";

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
      } catch {
        /* ignore */
      }
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
      } catch {
        /* ignore */
      }
    }
  };

  const feeLabel = competition.isFree
    ? "Gratis"
    : competition.fee > 0
      ? `Rp ${competition.fee.toLocaleString("id-ID")}`
      : "Gratis";

  const stepVariants = {
    enter: { opacity: 0, y: reduce ? 0 : 16 },
    center: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.4, ease: EASE },
    },
    exit: {
      opacity: 0,
      y: reduce ? 0 : -12,
      transition: { duration: reduce ? 0 : 0.2, ease: EASE },
    },
  };

  return (
    <PageShell>
      <SectionShell space="none" className="pt-24 pb-12 sm:pt-28 sm:pb-16">
        <Link
          href={`/competitions/${competition.id}`}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-astro-navy focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-astro-blue"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Detail lomba
        </Link>

        <div className="mt-4 mb-6 flex flex-col gap-2 sm:mb-8">
          <h1 className="font-heading text-3xl font-black tracking-tight text-astro-navy sm:text-4xl">
            Pendaftaran lomba
          </h1>
          <p className="text-sm leading-relaxed text-ink/75 sm:text-base">
            Lengkapi data peserta, lalu selesaikan pembayaran.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-8">
          <aside className="min-w-0 lg:sticky lg:top-24" aria-label="Ringkasan pendaftaran">
            <WindowCard title="Lomba pilihanmu" bodyClassName="gap-4 lg:gap-5">
              <div className="flex flex-wrap gap-2">
                <Pill tone={category.tone} size="sm">
                  {category.label}
                </Pill>
                <Pill tone="glass" size="sm">
                  {isTeam ? "Tim" : "Individu"}
                </Pill>
              </div>
              <SectionHeading
                title={competition.title}
                align="start"
                className="[&_h2]:text-xl [&_h2]:leading-snug"
              />
              {competition.tagline && (
                <p className="hidden text-sm leading-relaxed text-ink/70 lg:block">
                  {competition.tagline}
                </p>
              )}
              <Surface tone="tint" radius="xl" pad="sm">
                <dl className="flex flex-col gap-1">
                  <dt className="text-xs font-medium">Biaya pendaftaran</dt>
                  <dd className="font-heading text-2xl font-extrabold">{feeLabel}</dd>
                  {!competition.isFree && competition.fee > 0 && (
                    <dd className="text-xs text-ink/65">
                      {competition.batchName ? `${competition.batchName} / ` : ""}
                      {isTeam ? "Per tim" : "Per peserta"}
                    </dd>
                  )}
                </dl>
              </Surface>
              <p className="hidden text-xs leading-relaxed text-ink/65 lg:block">
                Pastikan data sesuai identitas peserta. Kuota terkunci setelah pembayaran
                terverifikasi.
              </p>
            </WindowCard>
          </aside>

          <div className="flex min-w-0 flex-col gap-5">
            <Surface tone="plain" radius="2xl" pad="sm">
              <ol aria-label="Tahapan pendaftaran" className="grid grid-cols-2 gap-3">
                {(
                  [
                    { number: 1, label: "Formulir", detail: "Data peserta", icon: FileText },
                    {
                      number: 2,
                      label: "Pembayaran",
                      detail: "Konfirmasi pendaftaran",
                      icon: CreditCard,
                    },
                  ] as const
                ).map(({ number, label, detail, icon: Icon }) => (
                  <li
                    key={number}
                    aria-current={step === number ? "step" : undefined}
                    className={cn(
                      "flex min-w-0 items-center gap-3 rounded-xl p-2 sm:p-3",
                      step === number && "bg-sky-bottom",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full",
                        step >= number
                          ? "bg-astro-navy text-white"
                          : "bg-sky-bottom text-astro-navy/60",
                      )}
                    >
                      {step > number ? (
                        <Check className="size-4" aria-hidden />
                      ) : (
                        <Icon className="size-4" aria-hidden />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-astro-navy sm:text-sm">
                        {number}. {label}
                      </p>
                      <p className="mt-0.5 hidden text-xs text-ink/65 sm:block">{detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Surface>

            {canChooseType && step === 1 && (
              <Surface
                tone="plain"
                radius="2xl"
                pad="md"
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p id="registration-format" className="text-sm font-bold text-astro-navy">
                    Format pendaftaran
                  </p>
                  <p className="mt-1 text-xs text-ink/65">Pilih sesuai penampilanmu.</p>
                </div>
                <ToggleGroup
                  type="single"
                  value={regType}
                  variant="outline"
                  size="lg"
                  aria-labelledby="registration-format"
                  onValueChange={(option) => {
                    if ((option !== "team" && option !== "individual") || option === regType)
                      return;
                    setRegType(option);
                    setFormData((prev) => ({
                      ...prev,
                      fullName: "",
                      identityNumber: "",
                      teamName: "",
                      leaderName: "",
                      leaderIdentity: "",
                      leaderGameId: "",
                      leaderPhotoUrl: "",
                      members: "",
                      memberDetails: [],
                    }));
                  }}
                  className="w-full sm:w-auto"
                >
                  <ToggleGroupItem value="individual" className="flex-1">
                    <UserRound />
                    Individu
                  </ToggleGroupItem>
                  <ToggleGroupItem value="team" className="flex-1">
                    <UsersRound />
                    Tim
                  </ToggleGroupItem>
                </ToggleGroup>
              </Surface>
            )}
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
                    <Surface
                      tone="tint"
                      radius="xl"
                      pad="md"
                      className="mb-5 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <p className="text-sm text-astro-navy">
                        Draf formulir dipulihkan dari sesi sebelumnya.
                      </p>
                      <Button type="button" variant="ghost" size="sm" onClick={handleResetDraft}>
                        Reset formulir
                      </Button>
                    </Surface>
                  )}
                  <FormStep
                    key={`${regType}-${
                      registrationId
                        ? `reg-${registrationId}`
                        : draftRestored
                          ? "draft-restored"
                          : "new"
                    }`}
                    competition={competition}
                    isTeam={isTeam}
                    regType={regType}
                    formData={formData}
                    setFormData={setFormData}
                    onContinue={handleFormSubmit}
                    existingRegId={
                      existingReg && existingReg.paymentStatus === "paid" ? null : registrationId
                    }
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
                    competition={competition}
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
        </div>
      </SectionShell>
    </PageShell>
  );
}
