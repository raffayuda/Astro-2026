# Graph Report - astro  (2026-08-19)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 946 nodes · 2402 edges · 90 communities (52 shown, 38 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bf607583`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 42
- Community 43
- Community 44
- Community 45
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 89

## God Nodes (most connected - your core abstractions)
1. `cn()` - 238 edges
2. `Button()` - 50 edges
3. `Badge()` - 28 edges
4. `Spinner()` - 25 edges
5. `db` - 22 edges
6. `Card()` - 20 edges
7. `CardContent()` - 19 edges
8. `Competition` - 19 edges
9. `Field()` - 17 edges
10. `Input()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `DashboardOverview()` --calls--> `cn()`  [EXTRACTED]
  app/dashboard/page.tsx → lib/utils.ts
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  app/layout.tsx → lib/utils.ts
- `CompetitionModal()` --calls--> `cn()`  [EXTRACTED]
  components/CompetitionModal.tsx → lib/utils.ts
- `AlertDialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert-dialog.tsx → lib/utils.ts
- `AlertDialogMedia()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert-dialog.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (90 total, 38 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (55): EMAIL_ALREADY_EXISTS_CODES, isEmailAlreadyRegistered(), SignupPage(), Step, Registration, CommitteeMember, Division, JABATAN_OPTIONS (+47 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (46): CekPendaftaranPage(), MotionImage, RegDetail, statusConfig, SertifikatPage(), MyRegistrationsPage(), statusColors, DashboardOverview() (+38 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (36): fadeUp, Props, AboutSection, fallbackData, FAQSection, SponsorSection, TimelineSection, calcTimeLeft() (+28 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (35): dynamic, metadata, PengumumanClient(), JourneyPage(), JourneyPhotoManager(), metadata, JourneyDetailPage(), MotionImage (+27 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (39): DashboardShell(), Props, Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage() (+31 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (31): ProfilePage(), AlertAction(), AlertTitle(), CardAction(), CardDescription(), CardFooter(), Checkbox(), FieldContent() (+23 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (38): drizzle-kit, eslint, eslint-config-next, oxfmt, oxlint, devDependencies, drizzle-kit, eslint (+30 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (26): committeeDivisions, committeeMembers, journeyPhotos, mediaPartners, sponsors, auth, committeeDivisionsModule, divisionSchema (+18 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (24): DELETE, dynamic, GET, PATCH, POST, PUT, runtime, FormStep() (+16 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (22): ResponsiveAlertDialogProps, ResponsiveModal(), ResponsiveModalProps, AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription() (+14 more)

### Community 10 - "Community 10"
Cohesion: 0.06
Nodes (31): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+23 more)

### Community 11 - "Community 11"
Cohesion: 0.10
Nodes (19): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut() (+11 more)

### Community 12 - "Community 12"
Cohesion: 0.15
Nodes (21): CommitteePage(), CommitteeSection(), MotionImage, CommitteeSection(), MotionImage, EventGallerySection(), GalleryCategory, GalleryPhoto (+13 more)

### Community 13 - "Community 13"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 14 - "Community 14"
Cohesion: 0.15
Nodes (13): competitionsModule, CompetitionInput, competitionInputSchema, prizeSchema, TimelineItem, timelineItemSchema, createCompetition(), getCompetition() (+5 more)

### Community 15 - "Community 15"
Cohesion: 0.13
Nodes (17): authAccounts, authSessions, authVerifications, categoriesRelations, competitionsRelations, competitionTimelineRelations, galleryCategories, galleryPhotos (+9 more)

### Community 16 - "Community 16"
Cohesion: 0.15
Nodes (14): CompetitionTimeline(), categoryConfig, CompetitionDetailPage(), fadeUp, fadeUpLight, MotionImage, toCompetition(), categoryConfig (+6 more)

### Community 17 - "Community 17"
Cohesion: 0.15
Nodes (13): csvResponse(), registrationsModule, ADMIN_FIELDS, RegistrationCreate, registrationCreateSchema, RegistrationListQuery, registrationListQuerySchema, SELF_SERVICE_FIELDS (+5 more)

### Community 18 - "Community 18"
Cohesion: 0.16
Nodes (15): Props, RegisterSection(), bankInfo, formatCurrency(), generateQrisPayload(), PaymentStep(), Props, Props (+7 more)

### Community 19 - "Community 19"
Cohesion: 0.15
Nodes (13): CATEGORIES, categoryConfig, CategoryType, CertItem, CompetitionItem, MotionImage, RegistrationWinner, CertItem (+5 more)

### Community 20 - "Community 20"
Cohesion: 0.14
Nodes (8): db, queryClient, faqs, journeys, faqSchema, faqsModule, journeySchema, journeysModule

### Community 21 - "Community 21"
Cohesion: 0.22
Nodes (13): Category, Competition, emptyForm, formatRupiah(), FormFields(), KompetisiPage(), parseRupiah(), InputGroupAddon() (+5 more)

### Community 22 - "Community 22"
Cohesion: 0.14
Nodes (11): dynamic, statusConfig, PaymentStatusUpdate(), categories, competitions, registrations, categoriesModule, categorySchema (+3 more)

### Community 23 - "Community 23"
Cohesion: 0.21
Nodes (9): MotionImage, CATEGORIES, InputGroup(), InputGroupInput(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.18
Nodes (10): geist, masterpiece, metadata, plusJakartaSans, TODO: Ubah ini menjadi new URL("https://astro.nurulfikri.ac.id") saat sudah…, TODO: Ubah domain canonical saat rilis, TODO: Ubah URL openGraph saat rilis, RootLayout() (+2 more)

### Community 25 - "Community 25"
Cohesion: 0.17
Nodes (11): "public"."users", "categories", "competitions", "faqs", "otp_codes", "registrations", "public"."categories", "public"."competitions" (+3 more)

### Community 26 - "Community 26"
Cohesion: 0.25
Nodes (9): Props, Pagination(), PaginationContent(), PaginationEllipsis(), PaginationItem(), PaginationLink(), PaginationLinkProps, PaginationNext() (+1 more)

### Community 27 - "Community 27"
Cohesion: 0.29
Nodes (10): competitionTimeline, CATEGORY_LABELS, Competition, prizeValue(), seed(), seedAdminUser(), seedCategories(), seedCompetitions() (+2 more)

### Community 28 - "Community 28"
Cohesion: 0.22
Nodes (9): next, next-themes, dependencies, next, next-themes, recharts, vaul, recharts (+1 more)

### Community 29 - "Community 29"
Cohesion: 0.29
Nodes (6): "public"."gallery_categories", "committee_members", "gallery_photos", "journeys", "public"."committee_divisions", "public"."committee_divisions"

### Community 30 - "Community 30"
Cohesion: 0.43
Nodes (5): buildPaginatedResponse(), Pagination, paginationSchema, galleryPhotosModule, photoSchema

### Community 31 - "Community 31"
Cohesion: 0.33
Nodes (5): CertItem, DraftEntry, Registration, WinnerManager(), WinnerManagerProps

### Community 32 - "Community 32"
Cohesion: 0.60
Nodes (3): COMMITTEE_DIVISIONS, CommitteeDivision, CommitteeMember

### Community 33 - "Community 33"
Cohesion: 0.50
Nodes (3): "accounts", "sessions", "verifications"

## Knowledge Gaps
- **265 isolated node(s):** `CategoryType`, `CompetitionItem`, `CertItem`, `RegistrationWinner`, `categoryConfig` (+260 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 5` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 9`, `Community 11`, `Community 12`, `Community 16`, `Community 18`, `Community 19`, `Community 21`, `Community 23`, `Community 24`, `Community 26`, `Community 31`?**
  _High betweenness centrality (0.242) - this node is a cross-community bridge._
- **Why does `db` connect `Community 20` to `Community 1`, `Community 2`, `Community 7`, `Community 14`, `Community 15`, `Community 17`, `Community 22`, `Community 27`, `Community 30`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 18` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 9`, `Community 11`, `Community 12`, `Community 16`, `Community 19`, `Community 21`, `Community 26`, `Community 31`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `CategoryType`, `CompetitionItem`, `CertItem` to the rest of the system?**
  _265 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09236947791164658 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07077922077922078 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.055218855218855216 - nodes in this community are weakly interconnected._