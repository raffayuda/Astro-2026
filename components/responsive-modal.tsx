"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  titleClassName?: string;
  descriptionClassName?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

/**
 * Responsive modal: bottom sheet (vaul Drawer) on mobile, centered Dialog on
 * desktop. Keeps one API surface so callers don't branch on breakpoints.
 */
export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  description,
  titleClassName,
  descriptionClassName,
  contentClassName,
  children,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  // Shared semantics: both roots treat `open=false` as closed.
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className={cn("max-h-[85vh]", contentClassName)}>
          {title && (
            <DrawerHeader>
              {title && <DrawerTitle className={titleClassName}>{title}</DrawerTitle>}
              {description && (
                <DrawerDescription className={descriptionClassName}>
                  {description}
                </DrawerDescription>
              )}
            </DrawerHeader>
          )}
          <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-h-[90vh] overflow-y-auto", contentClassName)}>
        {title && (
          <DialogHeader>
            {title && <DialogTitle className={titleClassName}>{title}</DialogTitle>}
            {description && (
              <DialogDescription className={descriptionClassName}>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}
