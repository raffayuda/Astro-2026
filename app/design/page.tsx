import type { Metadata } from "next"

import { DesignSystemClient } from "./DesignSystemClient"

export const metadata: Metadata = {
  title: "Design System — ASTRO 2026",
  description:
    "Living style guide for ASTRO 2026: colour tokens, typography, elevation and every brand component.",
  robots: { index: false, follow: false },
}

export default function DesignSystemPage() {
  return <DesignSystemClient />
}
