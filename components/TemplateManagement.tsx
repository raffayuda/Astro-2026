'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, Save, Plus, Trash2, FileImage } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { apiHelpers } from '@/src/lib/api';
import {
  useCertificateTemplates,
  useCertificateTemplateMutations,
} from '@/src/lib/hooks/use-queries';

interface OverlayField {
  field: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  align: string;
  maxWidth: number;
}

interface Props {
  competitionId: string;
}

const RANK_OPTIONS = ['1', '2', '3'] as const;
const DEFAULT_OVERLAY: OverlayField = {
  field: 'participantName',
  x: 0,
  y: 0,
  fontSize: 24,
  color: '#000000',
  align: 'center',
  maxWidth: 300,
};

const OVERLAY_FIELDS = [
  'participantName', 'rank', 'competitionTitle', 'category',
  'institution', 'teamName', 'teamMembers', 'date', 'competitionTagline', 'competitionType',
];

export default function TemplateManagement({ competitionId }: Props) {
  const [selectedRank, setSelectedRank] = useState<string>('1');
  const [templateImageUrl, setTemplateImageUrl] = useState('');
  const [overlayFields, setOverlayFields] = useState<OverlayField[]>([
    { ...DEFAULT_OVERLAY },
  ]);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState<number | null>(null);

  // Drag-to-position / drag-to-resize state for the preview overlay boxes.
  const [dragState, setDragState] = useState<{
    idx: number;
    mode: 'move' | 'resize' | 'fontsize';
    startPx: number;
    startPy: number;
    grabDX: number;
    grabDY: number;
    orig: OverlayField;
  } | null>(null);

  // Measure the rendered preview width so overlay coords (which are in the
  // template's natural pixel space) can be scaled down to match the preview.
  // Callback ref: the preview element only exists once a template image is
  // set, so we attach the ResizeObserver each time it mounts/unmounts.
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [displayWidth, setDisplayWidth] = useState(0);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setDisplayWidth(w);
    });
    ro.observe(el);
    // Initial measure in case the observer fires late
    setDisplayWidth(el.clientWidth || el.getBoundingClientRect().width || 0);
    return () => ro.disconnect();
  }, [templateImageUrl, naturalSize]);

  const previewScale =
    naturalSize && displayWidth > 0 ? displayWidth / naturalSize.w : 1;

  const { data: templatesRaw, isLoading: templatesLoading } =
    useCertificateTemplates(competitionId);
  const { create: createTemplateMut, remove: removeTemplateMut } =
    useCertificateTemplateMutations(competitionId);
  const templates = Array.isArray(templatesRaw) ? templatesRaw : [];

  const handleUploadTemplateImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingTemplate(true);
    try {
      const uploadRes = await apiHelpers.upload(file);
      const url = (uploadRes as any)?.url;
      if (!url) {
        toast.error('Upload template gagal');
        return;
      }
      setTemplateImageUrl(url);
      toast.success('Template image berhasil diupload');
    } catch {
      toast.error('Gagal upload template image');
    } finally {
      setUploadingTemplate(false);
    }
  };

  const handleAddOverlayField = () => {
    setOverlayFields((prev) => [...prev, { ...DEFAULT_OVERLAY }]);
  };

  const handleUpdateOverlay = (
    idx: number,
    updates: Partial<OverlayField>,
  ) => {
    setOverlayFields((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, ...updates } : f)),
    );
  };

  const handleRemoveOverlay = (idx: number) => {
    setOverlayFields((prev) => prev.filter((_, i) => i !== idx));
  };

  const onPointerDown = (
    e: React.PointerEvent,
    idx: number,
    mode: 'move' | 'resize' | 'fontsize',
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;
    const startPx = e.clientX - rect.left;
    const startPy = e.clientY - rect.top;
    const field = overlayFields[idx];
    setDragState({
      idx,
      mode,
      startPx,
      startPy,
      // Offset of the pointer within the overlay box, so the box doesn't
      // "jump" to the cursor when grabbed anywhere inside it.
      grabDX: startPx - (field.x || 0) * previewScale,
      grabDY: startPy - (field.y || 0) * previewScale,
      orig: { ...field },
    });
  };

  useEffect(() => {
    if (!dragState) return;

    const applyDrag = (e: PointerEvent) => {
      const rect = previewRef.current?.getBoundingClientRect();
      if (!rect) return;
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const scale = previewScale || 1;
      const { orig, mode } = dragState;

      if (mode === 'move') {
        const nx = (px - dragState.grabDX) / scale;
        const ny = (py - dragState.grabDY) / scale;
        setOverlayFields((prev) =>
          prev.map((f, i) =>
            i === dragState.idx
              ? {
                  ...f,
                  x: Math.max(0, Math.round(nx)),
                  y: Math.max(0, Math.round(ny)),
                }
              : f,
          ),
        );
      } else {
        // resize: change maxWidth from the drag distance
        // fontsize: change fontSize from the drag distance (vertically too)
        const dx = px - dragState.startPx;
        const dy = py - dragState.startPy;
        const maxWidth = Math.max(24, Math.round((orig.maxWidth || 300) + dx / scale));
        const fontSize = Math.max(8, Math.round((orig.fontSize || 16) + (dy - dx) / scale));
        setOverlayFields((prev) =>
          prev.map((f, i) =>
            i === dragState.idx
              ? mode === 'resize'
                ? { ...f, maxWidth }
                : { ...f, fontSize }
              : f,
          ),
        );
      }
    };

    const stopDrag = () => setDragState(null);

    window.addEventListener('pointermove', applyDrag);
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);
    return () => {
      window.removeEventListener('pointermove', applyDrag);
      window.removeEventListener('pointerup', stopDrag);
      window.removeEventListener('pointercancel', stopDrag);
    };
  }, [dragState, previewScale]);

  const handleSaveTemplate = async () => {
    if (!templateImageUrl) {
      toast.error('Upload template image dulu');
      return;
    }
    try {
      await createTemplateMut.mutateAsync({
        competitionId,
        rank: selectedRank,
        templateImageUrl,
        textOverlays: overlayFields,
        isActive: true,
      });
      toast.success(`Template Juara ${selectedRank} berhasil disimpan`);
    } catch {
      toast.error('Gagal menyimpan template');
    }
  };

  const handleLoadTemplate = (rank: string) => {
    const tmpl = templates.find((t: any) => String(t.rank) === rank);
    setSelectedRank(rank);
    if (tmpl) {
      setTemplateImageUrl(tmpl.templateImageUrl || '');
      setOverlayFields(
        (tmpl.textOverlays || []).map((o: any) => ({
          field: o.field || 'participantName',
          x: o.x || 0,
          y: o.y || 0,
          fontSize: o.fontSize || 16,
          color: o.color || '#000000',
          align: o.align || 'center',
          maxWidth: o.maxWidth || 300,
        })),
      );
    } else {
      setTemplateImageUrl('');
      setOverlayFields([{ ...DEFAULT_OVERLAY }]);
    }
  };

  const handleRemoveTemplate = async (id: number) => {
    if (!window.confirm('Hapus template ini?')) return;
    setDeletingTemplateId(id);
    try {
      await removeTemplateMut.mutateAsync(id);
      toast.success('Template dihapus');
    } catch {
      toast.error('Gagal hapus template');
    } finally {
      setDeletingTemplateId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Rank selector + existing template list */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-end gap-3">
          <div>
            <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              Peringkat
            </Label>
            <Select value={selectedRank} onValueChange={(v) => handleLoadTemplate(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Pilih peringkat" />
              </SelectTrigger>
              <SelectContent>
                {RANK_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    Juara {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="clip-angled-sm text-[10px] font-black uppercase tracking-wider"
            onClick={handleSaveTemplate}
            disabled={createTemplateMut.isPending}
          >
            {createTemplateMut.isPending ? <Spinner className="size-3.5" /> : <Save className="size-3.5" />}
            Simpan Template
          </Button>
        </div>
        <div className="flex gap-2">
          {templatesLoading && <Spinner className="size-4" />}
          {templates
            .filter((t: any) => String(t.rank) === selectedRank)
            .map((t: any) => (
              <Button
                key={t.id}
                size="sm"
                variant="outline"
                className="clip-angled-sm text-[10px] font-black uppercase tracking-wider"
                onClick={() => handleRemoveTemplate(t.id)}
                disabled={deletingTemplateId === t.id}
              >
                {deletingTemplateId === t.id ? <Spinner className="size-3.5" /> : <Trash2 className="size-3.5" />} Hapus
              </Button>
            ))}
        </div>
      </div>

      {/* Upload template image */}
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
          Template Image (hasil Canva)
        </Label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="template-upload"
            disabled={uploadingTemplate}
            onChange={handleUploadTemplateImage}
          />
          <label htmlFor="template-upload" className="flex-shrink-0 cursor-pointer">
            <Button asChild size="sm" variant="outline" disabled={uploadingTemplate}
              className="clip-angled-sm gap-1 text-[10px] font-black uppercase tracking-wider">
              <span>
                {uploadingTemplate ? <Spinner className="size-3" /> : <Upload className="size-3" />}
                {uploadingTemplate ? 'Mengunggah...' : 'Upload Gambar'}
              </span>
            </Button>
          </label>
          <Input
            value={templateImageUrl}
            onChange={(e) => setTemplateImageUrl(e.target.value)}
            placeholder="Atau masukkan URL gambar template"
            className="flex-1 text-xs"
          />
        </div>
        {templateImageUrl && (
          <div className="flex items-center gap-2 text-xs">
            <FileImage className="size-3.5 text-muted-foreground" />
            <a
              href={templateImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-600 hover:text-cyan-700"
            >
              {templateImageUrl}
            </a>
          </div>
        )}
      </div>

      {/* Text overlay fields */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            Text Overlay Fields
          </Label>
          <Button size="sm" variant="outline"
            className="clip-angled-sm gap-1 text-[10px] font-black uppercase tracking-wider"
            onClick={handleAddOverlayField}>
            <Plus className="size-3" /> Tambah Field
          </Button>
        </div>

        <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
          {overlayFields.map((field, idx) => (
            <div key={idx}
              className="flex flex-wrap items-end gap-2.5 rounded-lg border border-border p-3">
              <div className="flex-1 min-w-[120px]">
                <Label className="text-[9px] text-muted-foreground">Field</Label>
                <Select
                  value={field.field}
                  onValueChange={(v) => handleUpdateOverlay(idx, { field: v })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OVERLAY_FIELDS.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-16">
                <Label className="text-[9px] text-muted-foreground">X (px)</Label>
                <Input
                  type="number"
                  value={field.x}
                  onChange={(e) => handleUpdateOverlay(idx, { x: Number(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="w-16">
                <Label className="text-[9px] text-muted-foreground">Y (px)</Label>
                <Input
                  type="number"
                  value={field.y}
                  onChange={(e) => handleUpdateOverlay(idx, { y: Number(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="w-20">
                <Label className="text-[9px] text-muted-foreground">Font Size</Label>
                <Input
                  type="number"
                  value={field.fontSize}
                  onChange={(e) => handleUpdateOverlay(idx, { fontSize: Number(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="w-24">
                <Label className="text-[9px] text-muted-foreground">Color</Label>
                <Input
                  type="color"
                  value={field.color}
                  onChange={(e) => handleUpdateOverlay(idx, { color: e.target.value })}
                  className="h-8 w-12 cursor-pointer p-0.5"
                />
              </div>
              <div className="w-24">
                <Label className="text-[9px] text-muted-foreground">Align</Label>
                <Select
                  value={field.align}
                  onValueChange={(v) => handleUpdateOverlay(idx, { align: v })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-28">
                <Label className="text-[9px] text-muted-foreground">Max Width</Label>
                <Input
                  type="number"
                  value={field.maxWidth}
                  onChange={(e) => handleUpdateOverlay(idx, { maxWidth: Number(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-500"
                title="Hapus field"
                onClick={() => handleRemoveOverlay(idx)}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      {templateImageUrl && (
        <div className="pt-3">
          <Label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">
            Preview Template — Juara {selectedRank}
          </Label>
          <div
            ref={previewRef}
            className="relative w-full max-w-sm overflow-hidden rounded-lg border border-border bg-muted/20"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={templateImageUrl}
              src={templateImageUrl}
              alt={`Template Juara ${selectedRank}`}
              className="block w-full"
              onLoad={(e) => {
                const img = e.currentTarget;
                setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
              }}
            />
            {overlayFields.map((of, i) => {
              const ow = (of.maxWidth || 0) * previewScale;
              const isDragging = dragState?.idx === i;
              return (
                <div
                  key={i}
                  onPointerDown={(e) => onPointerDown(e, i, 'move')}
                  className={`absolute cursor-move border-2 border-cyan-500 bg-cyan-500/30 ${
                    isDragging ? 'ring-2 ring-cyan-300 z-10' : ''
                  }`}
                  style={{
                    left: `${of.x * previewScale}px`,
                    top: `${of.y * previewScale}px`,
                    width: ow,
                    fontSize: `${(of.fontSize || 16) * previewScale}px`,
                    color: of.color,
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    touchAction: 'none',
                  }}
                >
                  <span className="pointer-events-none">{of.field}</span>
                  {/* Drag handle: resize maxWidth */}
                  <span
                    onPointerDown={(e) => onPointerDown(e, i, 'resize')}
                    className="absolute -right-1.5 top-1/2 h-5 w-3 -translate-y-1/2 cursor-ew-resize border border-cyan-300 bg-cyan-600/90"
                    style={{ touchAction: 'none' }}
                  />
                  {/* Drag handle: fontSize */}
                  <span
                    onPointerDown={(e) => onPointerDown(e, i, 'fontsize')}
                    className="absolute -bottom-1.5 right-1/2 h-3 w-5 translate-x-1/2 cursor-ns-resize border border-cyan-300 bg-cyan-600/90"
                    style={{ touchAction: 'none' }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
