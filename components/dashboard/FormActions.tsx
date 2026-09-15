import type * as React from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/**
 * Standard save / cancel row for dashboard edit forms.
 */
function FormActions({
  onCancel,
  saving,
  saveLabel = "Simpan",
  cancelLabel = "Batal",
  className,
  saveDisabled,
}: {
  onCancel?: () => void;
  saving?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  className?: string;
  saveDisabled?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button type="submit" disabled={saving || saveDisabled}>
        {saving ? <Spinner data-icon="inline-start" /> : null}
        {saving ? "Menyimpan..." : saveLabel}
      </Button>
      {onCancel ? (
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          {cancelLabel}
        </Button>
      ) : null}
    </div>
  );
}

export { FormActions };
