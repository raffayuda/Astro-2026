"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, PageShell } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { useCategories, useCompetitions, queryKeys } from "@/src/lib/hooks/use-queries";
import { apiHelpers } from "@/src/lib/api";
import {
  CompetitionFormFields,
  CompetitionFormFooter,
  buildCompetitionPayload,
  competitionToForm,
  emptyCompetitionForm,
  validateCompetitionForm,
  type CompetitionForm,
} from "../../competition-form";

export default function EditCompetitionPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const router = useRouter();
  const qc = useQueryClient();
  const { data: categories = [] } = useCategories();
  const { data: competitions = [], isLoading } = useCompetitions();
  const [form, setForm] = useState<CompetitionForm>({ ...emptyCompetitionForm });
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const comp = competitions.find((c) => c.id === id);
    if (comp) {
      setForm(competitionToForm(comp));
      setReady(true);
    } else if (!isLoading && competitions.length > 0) {
      toast.error("Lomba tidak ditemukan");
      router.replace("/dashboard/competitions");
    }
  }, [competitions, id, isLoading, router]);

  const updateMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiHelpers.competitions.update(id, body as never),
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
      await updateMutation.mutateAsync(buildCompetitionPayload(form) as never);
      toast.success("Lomba berhasil diperbarui");
      router.push("/dashboard/competitions");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan lomba");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell loading={isLoading || !ready}>
      <PageHeader
        title="Edit Lomba"
        description={form.title || id}
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
        <CompetitionFormFields form={form} setForm={setForm} categories={categories} />
        <CompetitionFormFooter
          saving={saving}
          saveLabel="Simpan perubahan"
          onCancel={() => router.push("/dashboard/competitions")}
        />
      </form>
    </PageShell>
  );
}
