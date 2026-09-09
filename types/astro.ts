export type CategoryType = 'akademik' | 'olahraga' | 'esports' | 'kesenian-/-seni' | (string & {});

export interface Competition {
  id: string;
  title: string;
  category: CategoryType;
  tagline: string;
  description: string;
  fee: number;
  maxSlots: number;
  filledSlots: number;
  scheduleDate: string;
  location: string;
  prizes: {
    label: string;
    value: string;
  }[];
  rulesSummary: string[];
  rulebookUrl: string;
  type?: string;
  maxTeamMembers?: number;
  minTeamMembers?: number;
  registrationUrl: string;
  isFree?: boolean;
  origin?: 'internal' | 'external';
  contactPerson: {
    name: string;
    whatsapp: string;
  };
  isActive?: boolean;
  timeline?: TimelineItem[];
  hasBatches?: boolean;
  batches?: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    fee: number;
  }[];
  guidebookSections?: {
    id: string;
    title: string;
    content: string;
  }[];
  customFields?: CompetitionCustomField[];
  batchName?: string | null;
  playerPhotoRequired?: boolean;
}

export interface CompetitionCustomField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'image';
  placeholder?: string;
  options?: string[];
  required: boolean;
  description?: string;
}

export interface EventConfig {
  name: string;
  tagline: string;
  description: string;
  registrationDeadline: string;
  totalPrizePool: string;
  generalJuknisUrl: string;
}

export interface TimelineItem {
  date: string;
  title: string;
  desc: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface AstroData {
  eventConfig: EventConfig;
  competitions: Competition[];
  timeline: TimelineItem[];
  faqs: FAQItem[];
}

export interface JourneyCard {
  id: string;
  year: string;
  theme: string;
  participants: number;
  date: string;
  competitions: number;
  achievement: string;
  description: string;
  highlights: string[];
}

export interface GalleryPhoto {
  id: number | string;
  title: string;
  category: string;
  imageUrl: string;
  year: string;
  likesCount?: number | null;
}

export interface GalleryCategory {
  id: number;
  name: string;
  slug: string;
}

export interface CommitteeMember {
  id: number;
  name: string;
  role: string;
  division: string;
  divisionName: string;
  image: string;
  isLeader?: string | null;
  studyProgram?: string | null;
  batch?: string | null;
  quote?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  sortOrder?: number | null;
}

export interface CommitteeDivision {
  id: number;
  name: string;
  shortName?: string | null;
  slug: string;
  sortOrder?: number | null;
}

export interface CertificateFile {
  name: string;
  url: string;
}

export interface PublicRegistration {
  id: string;
  type: string;
  fullName: string | null;
  identityNumber: string | null;
  teamName: string | null;
  leaderName: string | null;
  leaderIdentity: string | null;
  leaderGameId: string | null;
  leaderPhotoUrl: string | null;
  members: string | null;
  memberDetails:
    | { name: string; gameId: string | null; photoUrl: string | null }[]
    | null;
  institution: string;
  email: string;
  whatsapp: string;
  customFields: Record<string, string> | null;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentAmount: number;
  batchName?: string | null;
  paymentReference: string | null;
  paymentLinkId?: string | null;
  paymentLinkUrl?: string | null;
  paymentExpiresAt?: string | Date | null;
  paymentCode?: string | null;
  paymentCodeType?: string | null;
  isWinner?: string | null;
  winnerRank?: string | null;
  certificateSent?: string | null;
  certificates?: CertificateFile[] | null;
  userId?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
  competitionName: string;
  competitionId: string;
  competitionCategory?: string;
  competitionContactName?: string | null;
  competitionContactWhatsapp?: string | null;
  competitionCustomFields?: CompetitionCustomField[] | null;
}
