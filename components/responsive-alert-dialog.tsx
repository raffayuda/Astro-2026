"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";

interface ResponsiveAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm?: () => void;
}

/**
 * Responsive confirmation: bottom sheet (vaul Drawer) on mobile, AlertDialog on
 * desktop. Use for destructive or confirm-style actions.
 */
export function ResponsiveAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelText = "Batal",
  confirmText = "Konfirmasi",
  destructive = false,
  loading = false,
  onConfirm,
}: ResponsiveAlertDialogProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            {title && <DrawerTitle>{title}</DrawerTitle>}
            {description && (
              <DrawerDescription>{description}</DrawerDescription>
            )}
          </DrawerHeader>
          <DrawerFooter className="flex-row justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              {cancelText}
            </Button>
            <Button
              variant={destructive ? "destructive" : "default"}
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              {loading ? <Spinner data-icon="inline-start" /> : null}
              {loading ? "Memproses..." : confirmText}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="clip-angled-lg p-8">
        <AlertDialogHeader>
          {title && (
            <AlertDialogTitle className="uppercase">{title}</AlertDialogTitle>
          )}
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading}
            className={cn("clip-angled-sm")}
          >
            {loading ? <Spinner data-icon="inline-start" /> : null}
            {loading ? "Memproses..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
