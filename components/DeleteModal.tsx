"use client";

import { ResponsiveAlertDialog } from "@/components/responsive-alert-dialog";

interface Props {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DeleteModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
}: Props) {
  return (
    <ResponsiveAlertDialog
      open={open}
      onOpenChange={(next) => !next && onCancel()}
      title={title}
      description={message}
      cancelText="Batal"
      confirmText={loading ? "Menghapus..." : "Hapus"}
      destructive
      loading={loading}
      onConfirm={onConfirm}
    />
  );
}
