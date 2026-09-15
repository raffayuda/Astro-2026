import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const paymentStatusStyles: Record<string, string> = {
  paid: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700",
  detecting: "border-sky-500/25 bg-sky-500/10 text-sky-700",
  pending: "border-amber-500/25 bg-amber-500/10 text-amber-700",
  failed: "border-destructive/25 bg-destructive/10 text-destructive",
  expired: "border-border bg-muted text-muted-foreground",
};

const paymentStatusLabels: Record<string, string> = {
  paid: "Lunas",
  detecting: "Detecting",
  pending: "Pending",
  failed: "Gagal",
  expired: "Expired",
};

function StatusBadge({
  status,
  className,
  labelMap = paymentStatusLabels,
  styleMap = paymentStatusStyles,
}: {
  status: string;
  className?: string;
  labelMap?: Record<string, string>;
  styleMap?: Record<string, string>;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border font-medium normal-case tracking-normal shadow-none",
        styleMap[status] ?? "text-muted-foreground",
        className,
      )}
    >
      {labelMap[status] ?? status}
    </Badge>
  );
}

export { StatusBadge, paymentStatusLabels, paymentStatusStyles };
