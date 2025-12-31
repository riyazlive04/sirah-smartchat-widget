export interface ThemeConfig {
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  position: 'bottom-right' | 'bottom-left';
}

export interface FeatureToggles {
  enableQuickReplies: boolean;
  enableEmojiPicker: boolean;
  enableReactions: boolean;
  enableReadReceipts: boolean;
  enableLeadScoring: boolean;
  enableSounds: boolean;
  enableAttachments: boolean;
}

export type IntentLevel = 'high' | 'medium' | 'low';

export interface QuickReply {
  label: LocalizedString;
  value: string;
  intent?: IntentLevel;
  icon?: string;
}

export interface ConversationStage {
  id: string;
  quickReplies: QuickReply[];
}

export interface MessageReaction {
  emoji: string;
  count: number;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface ClientConfig {
  botName: string;
  language: 'en' | 'ta';
  enableTamil: boolean;
  mode: 'browser' | 'hybrid';
  requireConsent: boolean;
  googleFormEndpoint: string;
  theme: ThemeConfig;
  features: FeatureToggles;
  welcomeMessage: {
    en: string;
    ta: string;
  };
  quickReplies?: QuickReply[];
  conversationStages?: {
    welcome: QuickReply[];
    services: QuickReply[];
    booking: QuickReply[];
    general: QuickReply[];
  };
  qualifyingQuestions?: {
    en: string;
    ta: string;
  };
  labels: {
    en: Labels;
    ta: Labels;
  };
}

export interface Labels {
  placeholder: string;
  send: string;
  poweredBy: string;
  consentTitle: string;
  consentMessage: string;
  consentAgree: string;
  consentDecline: string;
  nameLabel: string;
  phoneLabel: string;
  emailLabel: string;
  submitLead: string;
  thankYou: string;
  close: string;
  outsideHours?: string;
  welcomeBack?: string;
  qualifyingQuestion?: string;
}

export interface LocalizedString {
  en: string;
  ta: string;
}

export interface Service {
  name: LocalizedString;
  description: LocalizedString;
}

export interface Doctor {
  name: string;
  specialization: LocalizedString;
  experience: string;
}

export interface FAQ {
  q: LocalizedString;
  a: LocalizedString;
}

export interface Intent {
  keywords: string[];
  response: LocalizedString;
}

export interface WorkingHoursConfig {
  text: LocalizedString;
  schedule: {
    [key: string]: { open: string; close: string } | null; // null means closed
  };
}

export interface BusinessInfo {
  businessName: string;
  businessType: string;
  tagline: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  workingHours: LocalizedString | WorkingHoursConfig;
  services: Service[];
  doctors: Doctor[];
  faq: FAQ[];
  intents: {
    appointment: Intent;
    pricing: Intent;
    enquiry: Intent;
  };
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  quickReplies?: QuickReply[];
  attachments?: Attachment[];
  status?: MessageStatus;
  reactions?: MessageReaction[];
  intentLevel?: IntentLevel;
}

export interface LeadData {
  name: string;
  phone: string;
  email?: string;
  source: string;
  timestamp: string;
  businessName: string;
  intentLevel?: IntentLevel;
  serviceDiscussed?: string;
  qualifyingAnswer?: string;
  pageUrl?: string;
  language?: string;
  reactions?: string;
}

export type ChatState = 
  | 'idle' 
  | 'qualifying'
  | 'collecting-lead' 
  | 'consent-pending' 
  | 'lead-submitted';

export interface LeadContext {
  intentLevel: IntentLevel;
  serviceDiscussed?: string;
  qualifyingAnswer?: string;
  highIntentCount: number;
  reactions: Record<string, string[]>;
}
