import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Open Graph image kit for ASTRO 2026.
 *
 * Satori renders these, which means flexbox and a subset of CSS — no Tailwind,
 * no `display: grid`, no `-webkit-text-stroke`. Brand tokens from
 * `app/globals.css` are mirrored as literals and the sky wash and grass crest
 * are rebuilt from gradients and border radii.
 *
 * The layout stays deliberately spare: logo, one headline, one muted support
 * line, mascot. A social card is read at thumbnail size, so anything more
 * competes with the headline.
 *
 * Budget: Satori caps the route bundle (JSX + fonts + assets) at 500KB. The
 * art is therefore shipped from `public/og/` at roughly 2x its rendered size
 * rather than full resolution, and only one face is loaded — the logo already
 * carries the wordmark, so Alexandria is unnecessary and Plus Jakarta is the
 * heading face the design system specifies anyway.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

/** Mirror of the `--color-*` tokens the OG surface uses. */
const C = {
  navy: "#1E3A8A",
  ink: "#1F2937",
  white: "#FFFFFF",
} as const;

// Read once at module scope: none of this depends on request data.
const jakartaExtraBold = await readFile(
  join(process.cwd(), "public/fonts/PlusJakartaSans-ExtraBold.ttf"),
);
const logo = await readFile(join(process.cwd(), "public/og/logo.png"));
const mascot = await readFile(join(process.cwd(), "public/og/mascot.png"));

const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
const mascotSrc = `data:image/png;base64,${mascot.toString("base64")}`;

export type OgImageOptions = {
  /** Headline. Keep it to a few words: it is read at thumbnail size. */
  title: string;
  /** Support line, rendered muted under the headline. */
  subtitle?: string;
  /** Small glass chip under the copy. One short label, or omit. */
  tag?: string;
  /** Drop the mascot when the headline needs the full width. */
  mascot?: boolean;
};

/**
 * Render one OG surface. Route files stay declarative: they export `alt`,
 * `size` and `contentType`, then call this.
 */
export function ogImage({
  title,
  subtitle,
  tag,
  mascot: withMascot = true,
}: OgImageOptions) {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        width: "100%",
        height: "100%",
        padding: "72px 76px",
        background:
          "linear-gradient(160deg, #7EC8F5 0%, #B8E4FB 55%, #E8F6FE 100%)",
      }}
    >
      {/* Grass crest. `GrassStrip` uses an SVG path; an oversized ellipse
            gives the same soft horizon with shapes Satori renders reliably. */}
      <div
        style={{
          position: "absolute",
          left: -160,
          bottom: -150,
          width: 1520,
          height: 235,
          borderRadius: 760,
          background: "linear-gradient(180deg, #7CF0C1, #3ED08F)",
        }}
      />
      {/* One faint bubble for depth, fixed so the build stays byte-stable. */}
      <div
        style={{
          position: "absolute",
          left: 872,
          top: -168,
          width: 336,
          height: 336,
          borderRadius: 336,
          opacity: 0.6,
          background:
            "radial-gradient(circle at 36% 34%, rgba(255,255,255,0.8), rgba(255,255,255,0.1) 64%, rgba(255,255,255,0) 100%)",
        }}
      />
      {withMascot ? (
        // oxlint-disable-next-line next/no-img-element
        <img
          src={mascotSrc}
          width={296}
          height={366}
          style={{ position: "absolute", right: 74, bottom: 66 }}
        />
      ) : null}
      {/* oxlint-disable-next-line next/no-img-element */}
      <img src={logoSrc} width={232} height={169} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
          maxWidth: withMascot ? 700 : 1000,
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Jakarta",
            fontSize: title.length > 26 ? 60 : 72,
            fontWeight: 800,
            lineHeight: 1.14,
            letterSpacing: -1.8,
            color: C.navy,
          }}
        >
          {title}
        </div>

        {subtitle ? (
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontFamily: "Jakarta",
              fontSize: 32,
              fontWeight: 800,
              lineHeight: 1.36,
              letterSpacing: -0.4,
              color: C.ink,
              opacity: 0.44,
              maxWidth: 500,
            }}
          >
            {subtitle}
          </div>
        ) : null}

        {tag ? (
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              alignItems: "center",
              height: 52,
              marginTop: 30,
              paddingLeft: 26,
              paddingRight: 26,
              borderRadius: 999,
              background: "rgba(255,255,255,0.74)",
              color: C.navy,
              fontFamily: "Jakarta",
              fontSize: 24,
              fontWeight: 800,
              boxShadow:
                "inset 0 0 0 1px #FFFFFF, 0 8px 22px rgba(30,58,138,0.14)",
            }}
          >
            {tag}
          </div>
        ) : null}
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        {
          name: "Jakarta",
          data: jakartaExtraBold,
          style: "normal",
          weight: 800,
        },
      ],
    },
  );
}
