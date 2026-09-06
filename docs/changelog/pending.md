[22:00] - [src/db/migrations/0024_add_competition_batches.sql] - [ADD] - Add has_batches, batches, batch_name columns to DB schema
[22:00] - [src/db/schema/index.ts] - [UPDATE] - Define CompetitionBatch interface and schema relations
[22:00] - [src/server/modules/competitions/model.ts] - [UPDATE] - Add competitionBatchSchema and batch fields to competition input schemas
[22:00] - [src/server/modules/competitions/service.ts] - [UPDATE] - Add getActiveCompetitionBatch and getEffectiveFee calculation
[22:00] - [src/server/modules/registrations/service.ts] - [UPDATE] - Compute effective fee using active batch and store batchName in registrations table
[22:00] - [src/lib/competitions.ts] - [ADD] - Helper utilities for active batch resolution and pricing
[22:00] - [app/dashboard/competitions/page.tsx] - [UPDATE] - Add batch toggle, dynamic date range & fee inputs in add/edit modals and badge in competition list
[22:00] - [app/register/[id]/page.tsx] - [UPDATE] - Render active batch name and dynamic pricing on registration form
[22:00] - [app/competitions/[id]/page.tsx] - [UPDATE] - Display Gelombang Pendaftaran cards and active batch status
[22:00] - [components/CompetitionCard.tsx] - [UPDATE] - Display active batch pricing on competition cards
[22:23] - [src/db/migrations/0025_add_sponsor_is_current.sql] - [ADD] - Add is_current column to sponsors and media_partners
[22:23] - [src/db/schema/index.ts] - [UPDATE] - Add isCurrent boolean field to sponsors and mediaPartners tables
[22:23] - [src/server/modules/sponsors/index.ts] - [UPDATE] - Support isCurrent in Elysia sponsors endpoints
[22:23] - [src/server/modules/media-partners/index.ts] - [UPDATE] - Support isCurrent in Elysia media-partners endpoints
[22:23] - [app/dashboard/sponsor/page.tsx] - [UPDATE] - Add ASTRO 2026 toggle, filter buttons, and badges in admin dashboard
[22:23] - [components/SponsorSection.tsx] - [UPDATE] - Differentiate home variant (current sponsors & medpart or partnership CTA) and profile variant (track record)
[22:23] - [app/profile/page.tsx] - [UPDATE] - Pass variant="profile" to SponsorSection
[22:30] - [components/SponsorSection.tsx] - [UPDATE] - Integrate official Contact Persons for sponsorship (Muhammad Syafiq Arrafif, email) and media partners (Resna, Audy)
[22:34] - [components/FAQSection.tsx] - [UPDATE] - Point "Masih punya pertanyaan?" CTA directly to Instagram @astrosttnf
[22:41] - [components/TimelineSection.tsx] - [UPDATE] - Apply tentative badge, TBA styling, and notice card with Instagram CTA
[22:41] - [data/astro-data.json] - [UPDATE] - Set event timeline dates to TBA (Segera Diumumkan) with phase structure
[22:44] - [components/HeroSection.tsx] - [UPDATE] - Replace countdown timer with Option A glass announcement card (Segera Dibuka, Prize Pool, 3 Kategori, Venue)
[22:47] - [components/HeroSection.tsx] - [UPDATE] - Calibrate Hero typography clamp, container vertical centering, and compact card padding so entire hero fits above the fold on laptop screens
[22:50] - [components/HeroSection.tsx] - [UPDATE] - Redesign Hero announcement card to match ASTRO signature theme (angled polygon clip, corner cyan accent, 3-column metric blocks)
[22:53] - [components/HeroSection.tsx] - [UPDATE] - Replace heavy announcement card with ultra-clean Parallelogram Status Badge (Opsi 3): "ASTRO 2026 • PENDAFTARAN SEGERA DIBUKA (TBA)" matching button skew
[22:58] - [src/server/modules/upload/index.ts] - [UPDATE] - Add MAX_COMMITTEE_UPLOAD_SIZE (30MB) and /upload/committee endpoint for committee staff photos
[22:58] - [src/lib/api.ts] - [UPDATE] - Add apiHelpers.uploadCommittee with 30MB limit, support isCommittee flag in upload, and dynamic MB formatting in getApiError
[22:58] - [app/dashboard/committee/page.tsx] - [UPDATE] - Connect committee modal to uploadCommittee and show 30MB max upload size in UI
[23:09] - [src/lib/image-compression.ts] - [ADD] - Client-side HTML5 Canvas image compression utility (WebP, max 1600px/1200px) to safeguard Supabase Free Tier storage & egress
[23:09] - [src/lib/api.ts] - [UPDATE] - Integrate auto-compression into upload, uploadCommittee, and uploadPlayerPhoto, allowing up to 20-30MB raw file input
[23:09] - [app/register/[id]/PlayerPhotoField.tsx] - [UPDATE] - Clarify auto-optimization for player photo upload
[20:30] - [committe-photos/] - [FETCH] - Download all 70 committee member photos from Figma via MCP (1080x1350 scale 1x, named Divisi_Jabatan_Nama.png)
[21:02] - [committe-photos/] - [ORGANIZE] - Sort all 70 photos into division subfolders and clean up temporary helper scripts
[21:06] - [.gitignore] - [UPDATE] - Add committe-photos/ to ignore downloaded committee asset folder from git
[21:09] - [app/register/[id]/PlayerPhotoField.tsx] - [UPDATE] - Implement Drag & Drop image upload with visual feedback for player photos
[21:09] - [app/dashboard/committee/page.tsx] - [UPDATE] - Implement Drag & Drop dropzone for committee photo uploads with live preview and drive link support
