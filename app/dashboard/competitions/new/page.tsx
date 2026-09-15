"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, PageShell } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { useCategories, queryKeys } from "@/src/lib/hooks/use-queries";
import { apiHelpers } from "@/src/lib/api";
import {
  CompetitionFormFields,
  CompetitionFormFooter,
  buildCompetitionPayload,
  emptyCompetitionForm,
  validateCompetitionForm,
  type CompetitionForm,
} from "../competition-form";

export default function NewCompetitionPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: categories = [] } = useCategories();
  const [form, setForm] = useState<CompetitionForm>({ ...emptyCompetitionForm });
  const [saving, setSaving] = useState(false);

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiHelpers.competitions.create(body as never),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.competitions.all });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateCompetitionForm(form);
    if (error) {
      toast.error(error);
      return;
    }
    setSaving(true);
    try {
      await createMutation.mutateAsync(buildCompetitionPayload(form) as never);
      toast.success("Lomba berhasil ditambahkan");
      router.push("/dashboard/competitions");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menambahkan lomba");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Tambah Lomba"
        description="Buat kompetisi baru untuk katalog ASTRO 2026."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/competitions")}
          >
            <ArrowLeft data-icon="inline-start" /> Kembali
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-4 pb-20">
        <CompetitionFormFields
          form={form}
          setForm={setForm}
          isAdd
          categories={categories}
        />
        <CompetitionFormFooter
          saving={saving}
          saveLabel="Simpan lomba"
          onCancel={() => router.push("/dashboard/competitions")}
        />
      </form>
    </PageShell>
  );
}
