'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Check, X, ChevronUp, ChevronDown } from 'lucide-react';
import DeleteModal from '@/components/DeleteModal';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useFaqs, queryKeys } from '@/src/lib/hooks/use-queries';
import { apiHelpers } from '@/src/lib/api';
import { toast } from 'sonner';

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
  const [editForm, setEditForm] = useState({ question: '', answer: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ question: '', answer: '' });
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(1);

  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.faqs.all });

  const saveMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: { question: string; answer: string; sortOrder?: number | null } }) =>
      apiHelpers.faqs.update(String(id), body),
    onSuccess: () => { setEditingId(null); invalidate(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiHelpers.faqs.remove(String(id)),
    onSuccess: () => { setDeleteModal(null); invalidate(); },
  });

  const addMutation = useMutation({
    mutationFn: (body: { question: string; answer: string }) => apiHelpers.faqs.create(body),
    onSuccess: () => { setAddForm({ question: '', answer: '' }); setShowAdd(false); invalidate(); },
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
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan FAQ');
    }
    setSaving(false);
  };

  const handleDelete = (id: number) => {
    setDeleteModal({
      title: 'Hapus FAQ',
      message: 'Yakin ingin menghapus FAQ ini? Tindakan ini tidak bisa dibatalkan.',
      onConfirm: async () => {
        setDeleteLoading(true);
        try {
          await deleteMutation.mutateAsync(id);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Gagal menghapus FAQ');
        }
        setDeleteLoading(false);
      },
    });
  };

  const handleAdd = async () => {
    if (!addForm.question || !addForm.answer) return;
    setSaving(true);
    try {
      await addMutation.mutateAsync(addForm);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambahkan FAQ');
    }
    setSaving(false);
  };

  const handleMove = async (id: number, direction: 'up' | 'down') => {
    const idx = faqs.findIndex((f) => f.id === id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === faqs.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const currentOrder = faqs[idx].sortOrder;
    const swapOrder = faqs[swapIdx].sortOrder;

    // Swap sort orders
    await Promise.all([
      saveMutation.mutateAsync({ id: faqs[idx].id, body: { ...faqs[idx], sortOrder: swapOrder } }),
      saveMutation.mutateAsync({ id: faqs[swapIdx].id, body: { ...faqs[swapIdx], sortOrder: currentOrder } }),
    ]);

    invalidate();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="size-6 text-primary" /></div>;
  }

  const faqPaginated = faqs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">FAQ</h1>
          <p className="mt-1 text-sm font-light text-muted-foreground">{faqs.length} pertanyaan</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="clip-angled text-xs font-bold uppercase tracking-wider">
          <Plus data-icon="inline-start" /> Tambah FAQ
        </Button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <Card className="clip-angled border-border">
          <CardContent className="p-5">
            <h2 className="text-sm font-black uppercase tracking-tight text-foreground">Tambah FAQ Baru</h2>
            <FieldGroup className="mt-4 gap-3">
              <Field>
                <FieldLabel htmlFor="faq-question" required>Pertanyaan</FieldLabel>
                <Input
                  id="faq-question"
                  value={addForm.question}
                  onChange={(e) => setAddForm({ ...addForm, question: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="faq-answer" required>Jawaban</FieldLabel>
                <Textarea
                  id="faq-answer"
                  value={addForm.answer}
                  onChange={(e) => setAddForm({ ...addForm, answer: e.target.value })}
                  rows={4}
                />
              </Field>
              <div className="flex gap-2">
                <Button onClick={handleAdd} disabled={saving} className="clip-angled-sm text-xs font-bold uppercase tracking-wider">
                  {saving ? <Spinner data-icon="inline-start" /> : null}
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </Button>
                <Button variant="outline" onClick={() => setShowAdd(false)} className="clip-angled-sm text-xs font-bold uppercase tracking-wider">
                  Batal
                </Button>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>
      )}

      {/* FAQ List */}
      <Card className="clip-angled-lg border-border">
        <CardContent className="divide-y divide-border p-0">
          {faqPaginated.map((faq, idx) => (
            <div key={faq.id} className="p-5">
              {editingId === faq.id ? (
                <div className="flex flex-col gap-3">
                  <FieldGroup className="gap-3">
                    <Input
                      value={editForm.question}
                      onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                      className="font-medium"
                    />
                    <Textarea
                      value={editForm.answer}
                      onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                      rows={3}
                    />
                  </FieldGroup>
                  <div className="flex gap-2">
                    <Button size="sm" variant="default" className="gap-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-400" onClick={() => handleSave(faq.id)} disabled={saving}>
                      {saving ? <Spinner className="size-3" /> : <Check className="size-3" />} Simpan
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-[10px] font-bold uppercase tracking-wider" onClick={() => setEditingId(null)}>
                      <X className="size-3" /> Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-1 items-start gap-3">
                    {/* Move buttons */}
                    <div className="flex flex-col gap-0.5 pt-0.5">
                      <Button variant="ghost" size="icon-xs" onClick={() => handleMove(faq.id, 'up')} disabled={idx === 0} aria-label="Naik">
                        <ChevronUp />
                      </Button>
                      <Button variant="ghost" size="icon-xs" onClick={() => handleMove(faq.id, 'down')} disabled={idx === faqs.length - 1} aria-label="Turun">
                        <ChevronDown />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-sm font-bold text-foreground">{faq.question}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(faq)} title="Edit" aria-label="Edit">
                      <Pencil />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(faq.id)} title="Hapus" aria-label="Hapus" className="text-muted-foreground hover:text-destructive">
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Pagination currentPage={page} totalItems={faqs.length} pageSize={PAGE_SIZE} onPageChange={setPage} />

      {/* Delete Modal */}
      <DeleteModal
        open={!!deleteModal}
        title={deleteModal?.title || ''}
        message={deleteModal?.message || ''}
        onConfirm={deleteModal?.onConfirm || (() => {})}
        onCancel={() => setDeleteModal(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
