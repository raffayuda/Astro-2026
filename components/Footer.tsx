"use client";

/**
 * Kept as a thin delegate so the ~14 existing `<Footer />` call sites pick up
 * the brand footer without edits. New code should import `SiteFooter` from
 * `@/components/brand` directly.
 */
export { SiteFooter as default } from "@/components/brand";
