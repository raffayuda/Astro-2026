import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * The brand shadow ramp lives in `app/globals.css` under the `--shadow-*`
 * namespace. tailwind-merge only knows Tailwind's built-in scale, so it files
 * names like `shadow-soft-sm` under `shadow-color` and lets them survive a
 * later `shadow-none` — which is how form controls ended up painting a stray
 * bar under themselves inside `InputGroup`. Registering the ramp keeps
 * `cn()` overrides predictable.
 */
const BRAND_SHADOWS = [
  "soft-sm",
  "soft",
  "soft-lg",
  "glow-blue",
  "glow-orange",
  "glow-pink",
  "sticker-sm",
  "sticker",
  "sticker-lg",
  "gloss",
  "inset-top",
  "inset-screen",
  "plate",
]

const twMerge = extendTailwindMerge({
  extend: { classGroups: { shadow: [{ shadow: BRAND_SHADOWS }] } },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
