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
