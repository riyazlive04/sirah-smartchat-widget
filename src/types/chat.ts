export interface ThemeConfig {
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  position: 'bottom-right' | 'bottom-left';
}

export interface QuickReply {
  label: LocalizedString;
  value: string;
}

export interface ClientConfig {
  botName: string;
  language: 'en' | 'ta';
  enableTamil: boolean;
  mode: 'browser' | 'hybrid';
  requireConsent: boolean;
  googleFormEndpoint: string;
  theme: ThemeConfig;
  welcomeMessage: {
    en: string;
    ta: string;
  };
  quickReplies?: QuickReply[];
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

export interface BusinessInfo {
  businessName: string;
  businessType: string;
  tagline: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  workingHours: LocalizedString;
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
}

export interface LeadData {
  name: string;
  phone: string;
  email?: string;
  source: string;
  timestamp: string;
  businessName: string;
}

export type ChatState = 'idle' | 'collecting-lead' | 'consent-pending' | 'lead-submitted';
