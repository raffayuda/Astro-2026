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
