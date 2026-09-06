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
[22:15] - [src/db/migrations/0026_add_guidebook_sections.sql] - [ADD] - Add guidebook_sections jsonb column to competitions table
[22:15] - [src/db/schema/index.ts] - [UPDATE] - Define CompetitionGuidebookSection interface and add guidebookSections column
[22:15] - [src/server/modules/competitions/model.ts] - [UPDATE] - Add guidebookSectionSchema and validate guidebookSections in competitionInputSchema
[22:15] - [src/server/modules/competitions/service.ts] - [UPDATE] - Map and persist guidebookSections in createCompetition and updateCompetition
[22:15] - [components/GuidebookArticle.tsx] - [ADD] - Modular article component with interactive tabs, smart markdown styling, warning callouts, CP button, and PDF guidebook link
[22:15] - [components/admin/GuidebookSectionsBuilder.tsx] - [ADD] - Section builder for admin with add/reorder/delete, quick markdown toolbar (B, I, list, warn), and live preview
[22:15] - [app/dashboard/competitions/page.tsx] - [UPDATE] - Integrate GuidebookSectionsBuilder and rulebookUrl input field in admin competition modal
[22:15] - [app/competitions/[id]/page.tsx] - [UPDATE] - Render GuidebookArticle in dedicated full-width section, map guidebookSections, and support kesenian category styling
[22:15] - [src/db/update-competitions-guidebook.ts] - [ADD] - Seed detailed AGT and Cerdas Cermat guidebook sections, batches, fees, and rules into PostgreSQL
[22:18] - [src/db/seed.ts] - [UPDATE] - Support kesenian-/-seni category label and guidebookSections mapping during seed execution
[22:20] - [types/astro.ts] - [UPDATE] - Add kesenian-/-seni and guidebookSections to Competition type definition
[22:20] - [components/CompetitionCard.tsx] - [UPDATE] - Support kesenian-/-seni category badge with violet styling
[22:20] - [app/announcements/PengumumanClient.tsx] - [UPDATE] - Support kesenian-/-seni filter tab and badge in announcement winners list
[22:20] - [app/register/[id]/page.tsx] - [UPDATE] - Add kesenian-/-seni category styling to registration page
[22:30] - [src/db/migrations/0027_add_custom_fields.sql] - [ADD] - Add custom_fields jsonb columns to competitions and registrations tables
[22:30] - [src/db/schema/index.ts] - [UPDATE] - Define CompetitionCustomField interface and map customFields columns
[22:30] - [types/astro.ts] - [UPDATE] - Export CompetitionCustomField type and add customFields to Competition interface
[22:30] - [src/server/modules/competitions/model.ts] - [UPDATE] - Define competitionCustomFieldSchema and add customFields to competitionInputSchema
[22:30] - [src/server/modules/competitions/service.ts] - [UPDATE] - Persist and map customFields on create and update competition
[22:30] - [src/server/modules/registrations/model.ts] - [UPDATE] - Allow customFields in registrationCreateSchema and SELF_SERVICE_FIELDS
[22:30] - [src/server/modules/registrations/service.ts] - [UPDATE] - Persist and return customFields in registration queries and creation
[22:30] - [src/lib/forms/registration.ts] - [UPDATE] - Integrate custom fields dynamic validation and submission formatting
[22:30] - [app/register/[id]/CustomFieldUpload.tsx] - [ADD] - Drag-and-drop custom field image upload with automatic client-side WebP compression
[22:30] - [app/register/[id]/FormStep.tsx] - [UPDATE] - Render dynamic custom fields (text, textarea, select, image dropzones) in registration form
[22:30] - [components/admin/CustomFieldsBuilder.tsx] - [ADD] - Admin builder component for dynamic custom fields with presets (STT-NF + Berkas, Seni/AGT)
[22:30] - [app/dashboard/competitions/page.tsx] - [UPDATE] - Integrate CustomFieldsBuilder in admin competition modal
[22:30] - [app/dashboard/registrations/[id]/page.tsx] - [UPDATE] - Render custom fields card with text and image previews in registration admin detail
[22:30] - [src/db/update-competitions-custom-fields.ts] - [ADD] - Seed custom fields for AGT (bakat, judul karya, properti, foto KTM) and Cerdas Cermat (prodi/angkatan, KTM, foto profil, bukti follow IG)
[22:30] - [src/db/seed.ts] - [UPDATE] - Map customFields during competition seeding
[22:45] - [src/server/modules/competitions/model.ts] - [FIX] - Define competitionUpdateSchema with zero defaults to prevent partial updates (e.g. toggling isActive) from overwriting existing data with empty defaults
[22:45] - [src/server/modules/competitions/index.ts] - [FIX] - Use competitionUpdateSchema for PUT and PATCH endpoints instead of competitionInputSchema.partial()
[22:45] - [src/server/modules/categories/index.ts] - [FIX] - Add categoryUpdateSchema to prevent defaults from overwriting color and sortOrder on category update
[22:45] - [src/server/modules/sponsors/index.ts] - [FIX] - Add sponsorUpdateSchema to prevent defaults from overwriting sponsor tier, isCurrent, and sortOrder
[22:45] - [src/server/modules/media-partners/index.ts] - [FIX] - Add partnerUpdateSchema to prevent defaults from overwriting media partner isCurrent and sortOrder
[22:45] - [src/db/restore-competitions.ts] - [ADD] - Restore all competition details (AGT, Cerdas Cermat, Futsal Internal, Badminton, Mobile Legends) in database
