"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Check, X, ChevronUp, ChevronDown, HelpCircle } from "lucide-react";
import { EmptyState, FormActions, PageHeader, PageShell, SectionCard } from "@/components/dashboard";
import DeleteModal from "@/components/DeleteModal";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useFaqs, queryKeys } from "@/src/lib/hooks/use-queries";
import { apiHelpers } from "@/src/lib/api";
import { toast } from "sonner";

const PAGE_SIZE = 10;

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  sortOrder: number | null;
}

export default function FAQPage() {
  const qc = useQueryClient();
  const { data: faqsData, isLoading: loading } = useFaqs();
  const faqs = faqsData ?? [];
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ question: "", answer: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ question: "", answer: "" });
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(1);

  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.faqs.all });

  const saveMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: { question: string; answer: string; sortOrder?: number | null };
    }) => apiHelpers.faqs.update(String(id), body),
    onSuccess: () => {
      setEditingId(null);
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiHelpers.faqs.remove(String(id)),
    onSuccess: () => {
      setDeleteModal(null);
      invalidate();
    },
  });

  const addMutation = useMutation({
    mutationFn: (body: { question: string; answer: string }) => apiHelpers.faqs.create(body),
    onSuccess: () => {
      setAddForm({ question: "", answer: "" });
      setShowAdd(false);
      invalidate();
    },
  });

  const handleEdit = (faq: FAQItem) => {
    setEditingId(faq.id);
    setEditForm({ question: faq.question, answer: faq.answer });
  };

  const handleSave = async (id: number) => {
    setSaving(true);
    try {
      await saveMutation.mutateAsync({ id, body: editForm });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan FAQ");
    }
    setSaving(false);
  };

  const handleDelete = (id: number) => {
    setDeleteModal({
      title: "Hapus FAQ",
      message: "Yakin ingin menghapus FAQ ini? Tindakan ini tidak bisa dibatalkan.",
      onConfirm: async () => {
        setDeleteLoading(true);
        try {
          await deleteMutation.mutateAsync(id);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Gagal menghapus FAQ");
        }
        setDeleteLoading(false);
      },
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.question || !addForm.answer) return;
    setSaving(true);
    try {
      await addMutation.mutateAsync(addForm);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menambahkan FAQ");
    }
    setSaving(false);
  };

  const handleMove = async (id: number, direction: "up" | "down") => {
    const idx = faqs.findIndex((f) => f.id === id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === faqs.length - 1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const currentOrder = faqs[idx].sortOrder;
    const swapOrder = faqs[swapIdx].sortOrder;

    await Promise.all([
      saveMutation.mutateAsync({ id: faqs[idx].id, body: { ...faqs[idx], sortOrder: swapOrder } }),
      saveMutation.mutateAsync({
        id: faqs[swapIdx].id,
        body: { ...faqs[swapIdx], sortOrder: currentOrder },
      }),
    ]);

    invalidate();
  };

  const faqPaginated = faqs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <PageShell loading={loading}>
      <PageHeader
        title="FAQ"
        description={`${faqs.length} pertanyaan`}
        actions={
          <Button onClick={() => setShowAdd(!showAdd)}>
            <Plus data-icon="inline-start" /> Tambah FAQ
          </Button>
        }
      />

      {showAdd ? (
        <SectionCard title="Tambah FAQ">
          <form onSubmit={handleAdd} className="space-y-4">
            <FieldGroup className="gap-3">
              <Field>
                <FieldLabel htmlFor="faq-question" required>
                  Pertanyaan
                </FieldLabel>
                <Input
                  id="faq-question"
                  value={addForm.question}
                  onChange={(e) => setAddForm({ ...addForm, question: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="faq-answer" required>
                  Jawaban
                </FieldLabel>
                <Textarea
                  id="faq-answer"
                  value={addForm.answer}
                  onChange={(e) => setAddForm({ ...addForm, answer: e.target.value })}
                  rows={4}
                />
              </Field>
            </FieldGroup>
            <FormActions onCancel={() => setShowAdd(false)} saving={saving} />
          </form>
        </SectionCard>
      ) : null}

      {faqs.length === 0 ? (
        <SectionCard>
          <EmptyState
            icon={<HelpCircle />}
            title="Belum ada FAQ"
            description="Tambah pertanyaan yang sering ditanyakan peserta."
          />
        </SectionCard>
      ) : (
        <SectionCard bodyClassName="divide-y divide-border px-0">
          {faqPaginated.map((faq, idx) => {
            const absoluteIdx = (page - 1) * PAGE_SIZE + idx;
            return (
              <div key={faq.id} className="p-4 sm:p-5">
                {editingId === faq.id ? (
                  <div className="flex flex-col gap-3">
                    <FieldGroup className="gap-3">
                      <Input
                        value={editForm.question}
                        onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                      />
                      <Textarea
                        value={editForm.answer}
                        onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                        rows={3}
                      />
                    </FieldGroup>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSave(faq.id)} disabled={saving}>
                        {saving ? <Spinner className="size-3" /> : <Check className="size-3" />}
                        Simpan
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        <X className="size-3" /> Batal
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-2">
                      <div className="flex flex-col gap-0.5 pt-0.5">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleMove(faq.id, "up")}
                          disabled={absoluteIdx === 0}
                          aria-label="Naik"
                        >
                          <ChevronUp />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleMove(faq.id, "down")}
                          disabled={absoluteIdx === faqs.length - 1}
                          aria-label="Turun"
                        >
                          <ChevronDown />
                        </Button>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="mb-1 text-sm font-medium">{faq.question}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(faq)}
                        aria-label="Edit"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(faq.id)}
                        aria-label="Hapus"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </SectionCard>
      )}

      <Pagination
        currentPage={page}
        totalItems={faqs.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      <DeleteModal
        open={!!deleteModal}
        title={deleteModal?.title || ""}
        message={deleteModal?.message || ""}
        onConfirm={deleteModal?.onConfirm || (() => {})}
        onCancel={() => setDeleteModal(null)}
        loading={deleteLoading}
      />
    </PageShell>
  );
}
