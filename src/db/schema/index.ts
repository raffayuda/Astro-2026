import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  jsonb,
  serial,
  boolean,
  index,
  unique,
} from "drizzle-orm/pg-core";

/* ─── Categories ─── */
export const categories = pgTable("categories", {
  id: text("id").primaryKey(), // 'akademik' | 'olahraga' | 'esports' | custom
  label: text("label").notNull(), // 'Akademik' | 'Olahraga' | 'Esports'
  color: text("color")
    .notNull()
    .default("text-cyan-700 bg-cyan-50 border-cyan-200"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  competitions: many(competitions),
}));

/* ─── Competitions ─── */
export const competitions = pgTable(
  "competitions",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    category: text("category")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    tagline: text("tagline"),
    description: text("description"),
    fee: integer("fee").notNull().default(0),
    maxSlots: integer("max_slots").notNull().default(0),
    filledSlots: integer("filled_slots").notNull().default(0),
    scheduleDate: timestamp("schedule_date"),
    location: text("location"),
    prizesFirst: text("prizes_first"),
    prizesSecond: text("prizes_second"),
    prizesThird: text("prizes_third"),
    prizes: jsonb("prizes")
      .$type<{ label: string; value: string }[]>()
      .default([])
      .notNull(),
    rulesSummary: jsonb("rules_summary").$type<string[]>(),
    rulebookUrl: text("rulebook_url"),
    contactName: text("contact_name"),
    contactWhatsapp: text("contact_whatsapp"),
    isActive: text("is_active").notNull().default("1"), // '1' = active, '0' = inactive
    type: text("type").default("individual"), // 'individual' | 'team'
    maxTeamMembers: integer("max_team_members").default(1),
    minTeamMembers: integer("min_team_members").default(1),
    membersRequired: text("members_required").default("optional"), // 'optional' | 'required'
    isFree: text("is_free").default("0"), // '0' = bayar, '1' = gratis
    origin: text("origin").default("internal"), // 'internal' | 'external'
    certificateEnabled: text("certificate_enabled").default("0"), // '0' = tidak ada, '1' = ada
    certificateType: text("certificate_type").default("winner"), // 'winner' = juara saja, 'all' = semua peserta
    certificateTemplate: text("certificate_template"), // URL file template sertifikat
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("competitions_category_idx").on(table.category)],
);

export const competitionsRelations = relations(
  competitions,
  ({ one, many }) => ({
    category: one(categories, {
      fields: [competitions.category],
      references: [categories.id],
    }),
    registrations: many(registrations),
    timeline: many(competitionTimeline),
  }),
);

/* ─── Registrations ─── */
export const registrations = pgTable(
  "registrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    competitionId: text("competition_id")
      .notNull()
      .references(() => competitions.id, { onDelete: "restrict" }),
    type: text("type").notNull(), // 'team' | 'individual'
    // Individual fields
    fullName: text("full_name"),
    identityNumber: text("identity_number"),
    // Team fields
    teamName: text("team_name"),
    leaderName: text("leader_name"),
    leaderIdentity: text("leader_identity"),
    members: text("members"),
    // Common fields
    institution: text("institution").notNull(),
    email: text("email").notNull(),
    whatsapp: text("whatsapp").notNull(),
    // Payment
    paymentStatus: text("payment_status").notNull().default("pending"), // 'pending' | 'detecting' | 'paid' | 'failed'
    paymentMethod: text("payment_method"), // 'qris' | 'transfer'
    paymentAmount: integer("payment_amount").notNull(),
    paymentReference: text("payment_reference"),
    // Winner
    isWinner: text("is_winner").default("0"), // '0' | '1'
    winnerRank: text("winner_rank"), // '1' | '2' | '3' | null
    certificateSent: text("certificate_sent").default("0"), // '0' | '1'
    certificates: jsonb("certificates")
      .$type<{ name: string; url: string }[]>()
      .default([])
      .notNull(),
    // User link
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("registrations_competition_id_idx").on(table.competitionId),
    index("registrations_user_id_idx").on(table.userId),
  ],
);

export const registrationsRelations = relations(registrations, ({ one }) => ({
  competition: one(competitions, {
    fields: [registrations.competitionId],
    references: [competitions.id],
  }),
  user: one(users, {
    fields: [registrations.userId],
    references: [users.id],
  }),
}));

/* ─── Competition Timeline ─── */
export const competitionTimeline = pgTable(
  "competition_timeline",
  {
    id: serial("id").primaryKey(),
    competitionId: text("competition_id")
      .notNull()
      .references(() => competitions.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    title: text("title").notNull(),
    desc: text("desc").notNull(),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("competition_timeline_competition_id_idx").on(table.competitionId),
  ],
);

export const competitionTimelineRelations = relations(
  competitionTimeline,
  ({ one }) => ({
    competition: one(competitions, {
      fields: [competitionTimeline.competitionId],
      references: [competitions.id],
    }),
  }),
);

/* ─── Users ─── */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").notNull().default("participant"), // 'admin' | 'participant'
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  banned: boolean("banned").default(false).notNull(),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* ─── Better Auth: Sessions ─── */
export const authSessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    impersonatedBy: text("impersonated_by"),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)],
);

/* ─── Better Auth: Accounts (OAuth / linked accounts) ─── */
export const authAccounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("accounts_user_id_idx").on(table.userId),
    unique("accounts_provider_account_unique").on(
      table.providerId,
      table.accountId,
    ),
  ],
);

/* ─── Better Auth: Verification tokens / OTP ─── */
export const authVerifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  registrations: many(registrations),
}));

/* ─── FAQs ─── */
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").default(0),
});

/* ─── Sponsors ─── */
export const sponsors = pgTable("sponsors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tier: text("tier").notNull().default("gold"), // 'platinum' | 'gold' | 'silver'
  website: text("website"),
  logo: text("logo"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ─── Media Partners ─── */
export const mediaPartners = pgTable("media_partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  website: text("website"),
  logo: text("logo"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ─── Gallery Categories ─── */
export const galleryCategories = pgTable("gallery_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ─── Committee Divisions ─── */
export const committeeDivisions = pgTable("committee_divisions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name"),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ─── Journeys ─── */
export const journeys = pgTable("journeys", {
  id: text("id").primaryKey(), // auto-generated, tidak diinput admin (e.g. 'j-2023')
  year: text("year"), // tahun penyelenggaraan (diinput admin, e.g. '2024')
  theme: text("theme").notNull(),
  participants: integer("participants").default(0),
  universities: integer("universities").default(0),
  competitionsCount: integer("competitions_count").default(0),
  achievement: text("achievement"),
  description: text("description"),
  highlights: jsonb("highlights").$type<string[]>(),
  isActive: text("is_active").default("1"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ─── Journey Photos (documentation gallery) ─── */
export const journeyPhotos = pgTable(
  "journey_photos",
  {
    id: serial("id").primaryKey(),
    journeyId: text("journey_id")
      .notNull()
      .references(() => journeys.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    caption: text("caption"),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("journey_photos_journey_id_idx").on(table.journeyId)],
);

export const journeyPhotosRelations = relations(journeyPhotos, ({ one }) => ({
  journey: one(journeys, {
    fields: [journeyPhotos.journeyId],
    references: [journeys.id],
  }),
}));

/* ─── Gallery Photos ─── */
export const galleryPhotos = pgTable(
  "gallery_photos",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    category: text("category")
      .notNull()
      .references(() => galleryCategories.slug, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    imageUrl: text("image_url").notNull(),
    year: text("year").notNull(),
    likesCount: integer("likes_count").default(0),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("gallery_photos_category_idx").on(table.category)],
);

/* ─── Committee Members ─── */
export const committeeMembers = pgTable(
  "committee_members",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    role: text("role").notNull(), // jabatan (e.g. 'Ketua Pelaksana', 'Staf')
    division: text("division")
      .notNull()
      .references(() => committeeDivisions.slug, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    divisionName: text("division_name").notNull(),
    image: text("image").notNull(),
    isLeader: text("is_leader").default("0"), // '0' | '1' — controls tipe (Koordinator/Staf)
    studyProgram: text("study_program"),
    batch: text("batch"),
    quote: text("quote"),
    instagram: text("instagram"),
    linkedin: text("linkedin"),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("committee_members_division_idx").on(table.division)],
);
