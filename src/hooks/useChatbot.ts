import { useState, useCallback, useEffect, useRef } from 'react';
import type { Message, ChatState, BusinessInfo, ClientConfig, LeadData, LocalizedString, QuickReply, Attachment } from '@/types/chat';
import { useChatPersistence } from './useChatPersistence';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function getLocalizedText(text: LocalizedString | string, lang: 'en' | 'ta'): string {
  if (typeof text === 'string') return text;
  return text[lang] || text.en;
}

function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

function detectLeadIntent(message: string, intents: BusinessInfo['intents']): 'appointment' | 'pricing' | 'enquiry' | null {
  const normalized = normalizeText(message);
  
  for (const [intentName, intent] of Object.entries(intents)) {
    for (const keyword of intent.keywords) {
      if (normalized.includes(normalizeText(keyword))) {
        return intentName as 'appointment' | 'pricing' | 'enquiry';
      }
    }
  }
  
  return null;
}

function findFAQMatch(message: string, faqs: BusinessInfo['faq'], lang: 'en' | 'ta'): string | null {
  const normalized = normalizeText(message);
  
  for (const faq of faqs) {
    const question = getLocalizedText(faq.q, lang).toLowerCase();
    const words = question.split(/\s+/).filter(w => w.length > 3);
    
    let matchCount = 0;
    for (const word of words) {
      if (normalized.includes(word)) {
        matchCount++;
      }
    }
    
    if (matchCount >= 2 || (words.length <= 3 && matchCount >= 1)) {
      return getLocalizedText(faq.a, lang);
    }
  }
  
  return null;
}

function findServiceInfo(message: string, services: BusinessInfo['services'], lang: 'en' | 'ta'): string | null {
  const normalized = normalizeText(message);
  
  for (const service of services) {
    const serviceName = getLocalizedText(service.name, lang).toLowerCase();
    if (normalized.includes(serviceName.split(' ')[0]) || 
        serviceName.split(' ').some(word => normalized.includes(word) && word.length > 3)) {
      const name = getLocalizedText(service.name, lang);
      const desc = getLocalizedText(service.description, lang);
      
      if (lang === 'ta') {
        return `ஆம், நாங்கள் ${name} வழங்குகிறோம். ${desc}. இந்த சேவையைப் பற்றி மேலும் அறிய விரும்புகிறீர்களா?`;
      }
      return `Yes, we offer ${name}. ${desc}. Would you like to know more about this service?`;
    }
  }
  
  return null;
}

function findDoctorInfo(message: string, doctors: BusinessInfo['doctors'], lang: 'en' | 'ta'): string | null {
  const normalized = normalizeText(message);
  const doctorKeywords = ['doctor', 'dr', 'dentist', 'specialist', 'மருத்துவர்', 'டாக்டர்'];
  
  if (doctorKeywords.some(keyword => normalized.includes(keyword))) {
    const doctorList = doctors.map(d => {
      const spec = getLocalizedText(d.specialization, lang);
      return `${d.name} - ${spec} (${d.experience})`;
    }).join('\n');
    
    if (lang === 'ta') {
      return `எங்கள் மருத்துவர்கள்:\n${doctorList}`;
    }
    return `Our doctors:\n${doctorList}`;
  }
  
  return null;
}

function generateFallbackResponse(businessInfo: BusinessInfo, lang: 'en' | 'ta'): string {
  const name = businessInfo.businessName;
  
  if (lang === 'ta') {
    return `${name}-க்கு வருகை தந்தமைக்கு நன்றி! உங்கள் கேள்வியைப் புரிந்துகொள்ள முடியவில்லை. எங்கள் சேவைகள், நேரம் அல்லது சந்திப்பு பற்றி கேட்கலாமா?`;
  }
  
  return `Thanks for reaching out to ${name}! I'm not sure I understood your question. Could you ask about our services, timings, or booking an appointment?`;
}

interface UseChatbotReturn {
  messages: Message[];
  chatState: ChatState;
  isTyping: boolean;
  sendMessage: (message: string, attachments?: Attachment[]) => void;
  handleConsent: (agreed: boolean) => void;
  initializeChat: () => void;
  clearChat: () => void;
  labels: any;
  lang: 'en' | 'ta';
  onMessageSent?: () => void;
  onMessageReceived?: () => void;
}

export function useChatbot(
  config: ClientConfig | null, 
  businessInfo: BusinessInfo | null,
  soundCallbacks?: {
    onMessageSent?: () => void;
    onMessageReceived?: () => void;
  }
): UseChatbotReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatState, setChatState] = useState<ChatState>('idle');
  const [pendingLead, setPendingLead] = useState<Partial<LeadData>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [leadField, setLeadField] = useState<'name' | 'phone' | 'email' | null>(null);
  const [initialized, setInitialized] = useState(false);

  const { loadStoredData, saveData, clearData, parseStoredMessages } = useChatPersistence(businessInfo?.businessName);

  const lang = config?.language || 'en';
  const labels = config?.labels[lang];

  // Load persisted chat history on mount
  useEffect(() => {
    if (!initialized && businessInfo) {
      const stored = loadStoredData();
      if (stored) {
        const restoredMessages = parseStoredMessages(stored);
        if (restoredMessages.length > 0) {
          setMessages(restoredMessages);
          setChatState(stored.chatState);
          setPendingLead(stored.pendingLead);
          setLeadField(stored.leadField);
        }
      }
      setInitialized(true);
    }
  }, [initialized, businessInfo, loadStoredData, parseStoredMessages]);

  // Save chat history whenever state changes
  useEffect(() => {
    if (initialized && messages.length > 0) {
      saveData(messages, chatState, pendingLead, leadField);
    }
  }, [messages, chatState, pendingLead, leadField, initialized, saveData]);

  const addMessage = useCallback((role: 'user' | 'bot', content: string, quickReplies?: QuickReply[], attachments?: Attachment[]) => {
    const message: Message = {
      id: generateId(),
      role,
      content,
      timestamp: new Date(),
      quickReplies,
      attachments
    };
    setMessages(prev => [...prev, message]);
    
    // Trigger sound callbacks
    if (role === 'user' && soundCallbacks?.onMessageSent) {
      soundCallbacks.onMessageSent();
    } else if (role === 'bot' && soundCallbacks?.onMessageReceived) {
      soundCallbacks.onMessageReceived();
    }
    
    return message;
  }, [soundCallbacks]);

  const simulateTyping = useCallback(async (delay: number = 800) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    setIsTyping(false);
  }, []);

  const processMessage = useCallback(async (userMessage: string, attachments?: Attachment[]) => {
    if (!config || !businessInfo) return;

    addMessage('user', userMessage, undefined, attachments);
    await simulateTyping();

    // Handle lead collection flow
    if (chatState === 'collecting-lead') {
      if (leadField === 'name') {
        setPendingLead(prev => ({ ...prev, name: userMessage }));
        setLeadField('phone');
        addMessage('bot', labels?.phoneLabel || 'Your phone number?');
        return;
      }
      
      if (leadField === 'phone') {
        const phoneRegex = /[\d\s\-+()]{8,}/;
        if (!phoneRegex.test(userMessage)) {
          addMessage('bot', lang === 'ta' 
            ? 'சரியான தொலைபேசி எண்ணை உள்ளிடவும்.' 
            : 'Please enter a valid phone number.');
          return;
        }
        setPendingLead(prev => ({ ...prev, phone: userMessage }));
        setLeadField('email');
        addMessage('bot', labels?.emailLabel || 'Email (optional, press enter to skip)?');
        return;
      }
      
      if (leadField === 'email') {
        const email = userMessage.toLowerCase().trim();
        if (email && email !== 'skip' && !email.includes('@')) {
          addMessage('bot', lang === 'ta'
            ? 'சரியான மின்னஞ்சலை உள்ளிடவும் அல்லது தவிர்க்க "skip" என்று தட்டச்சு செய்யவும்.'
            : 'Please enter a valid email or type "skip" to continue.');
          return;
        }
        
        if (email && email !== 'skip' && email.includes('@')) {
          setPendingLead(prev => ({ ...prev, email }));
        }
        
        setLeadField(null);
        
        if (config.requireConsent) {
          setChatState('consent-pending');
          addMessage('bot', `${labels?.consentTitle}\n\n${labels?.consentMessage}`);
        } else {
          // Auto-submit if consent not required
          await submitLead();
        }
        return;
      }
    }

    // Handle file attachments
    if (attachments && attachments.length > 0) {
      const response = lang === 'ta'
        ? 'உங்கள் கோப்பைப் பெற்றுள்ளோம். எங்கள் குழு உங்களைத் தொடர்புகொள்ளும்.'
        : 'Thanks for sharing! I\'ve received your files. Our team will review them.';
      addMessage('bot', response, config.quickReplies);
      return;
    }

    // Check for FAQ match
    const faqMatch = findFAQMatch(userMessage, businessInfo.faq, lang);
    if (faqMatch) {
      addMessage('bot', faqMatch, config.quickReplies);
      return;
    }

    // Check for service info
    const serviceMatch = findServiceInfo(userMessage, businessInfo.services, lang);
    if (serviceMatch) {
      addMessage('bot', serviceMatch, config.quickReplies);
      return;
    }

    // Check for doctor info
    const doctorMatch = findDoctorInfo(userMessage, businessInfo.doctors, lang);
    if (doctorMatch) {
      addMessage('bot', doctorMatch, config.quickReplies);
      return;
    }

    // Check for lead intent
    const intent = detectLeadIntent(userMessage, businessInfo.intents);
    if (intent) {
      const intentResponse = getLocalizedText(businessInfo.intents[intent].response, lang);
      addMessage('bot', intentResponse);
      
      // Start lead collection
      setChatState('collecting-lead');
      setLeadField('name');
      await simulateTyping(500);
      addMessage('bot', labels?.nameLabel || 'May I have your name?');
      return;
    }

    // Handle working hours
    const hoursKeywords = ['timing', 'time', 'hour', 'open', 'close', 'when', 'நேரம்', 'திறப்பு'];
    if (hoursKeywords.some(k => normalizeText(userMessage).includes(k))) {
      addMessage('bot', getLocalizedText(businessInfo.workingHours, lang), config.quickReplies);
      return;
    }

    // Handle location
    const locationKeywords = ['where', 'location', 'address', 'direction', 'எங்கே', 'முகவரி'];
    if (locationKeywords.some(k => normalizeText(userMessage).includes(k))) {
      addMessage('bot', businessInfo.location, config.quickReplies);
      return;
    }

    // Handle contact
    const contactKeywords = ['contact', 'phone', 'call', 'email', 'தொடர்பு', 'அழைப்பு'];
    if (contactKeywords.some(k => normalizeText(userMessage).includes(k))) {
      const response = lang === 'ta'
        ? `எங்களை தொடர்பு கொள்ளவும்:\n📞 ${businessInfo.phone}\n📧 ${businessInfo.email}`
        : `Contact us at:\n📞 ${businessInfo.phone}\n📧 ${businessInfo.email}`;
      addMessage('bot', response, config.quickReplies);
      return;
    }

    // Fallback response
    addMessage('bot', generateFallbackResponse(businessInfo, lang), config.quickReplies);
  }, [config, businessInfo, chatState, leadField, labels, lang, addMessage, simulateTyping]);

  const submitLead = useCallback(async () => {
    if (!config || !businessInfo) return;

    const leadData: LeadData = {
      name: pendingLead.name || '',
      phone: pendingLead.phone || '',
      email: pendingLead.email,
      source: 'Sirah SmartChat',
      timestamp: new Date().toISOString(),
      businessName: businessInfo.businessName
    };

    // Submit to Google Form if configured
    if (config.mode === 'hybrid' && config.googleFormEndpoint !== 'REPLACE_WITH_CLIENT_FORM_URL') {
      try {
        const formData = new FormData();
        Object.entries(leadData).forEach(([key, value]) => {
          if (value) formData.append(key, value);
        });

        await fetch(config.googleFormEndpoint, {
          method: 'POST',
          mode: 'no-cors',
          body: formData
        });
      } catch (error) {
        console.error('Lead submission failed:', error);
      }
    }

    setChatState('lead-submitted');
    addMessage('bot', labels?.thankYou || 'Thank you! We\'ll be in touch soon.', config.quickReplies);
    setPendingLead({});
  }, [config, businessInfo, pendingLead, labels, addMessage]);

  const handleConsent = useCallback(async (agreed: boolean) => {
    if (agreed) {
      await submitLead();
    } else {
      setChatState('idle');
      setPendingLead({});
      const response = lang === 'ta'
        ? 'பரவாயில்லை! உங்கள் கேள்விகளுக்கு உதவ நான் இங்கே இருக்கிறேன்.'
        : 'No problem! I\'m here to help with any questions you have.';
      addMessage('bot', response, config?.quickReplies);
    }
  }, [submitLead, lang, addMessage, config]);

  const initializeChat = useCallback(() => {
    if (config && messages.length === 0) {
      const welcomeMsg = getLocalizedText(config.welcomeMessage, lang);
      addMessage('bot', welcomeMsg, config.quickReplies);
    }
  }, [config, lang, messages.length, addMessage]);

  const sendMessage = useCallback((message: string, attachments?: Attachment[]) => {
    if (!message.trim() && (!attachments || attachments.length === 0)) return;
    processMessage(message.trim(), attachments);
  }, [processMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setChatState('idle');
    setPendingLead({});
    setLeadField(null);
    clearData();
  }, [clearData]);

  return {
    messages,
    chatState,
    isTyping,
    sendMessage,
    handleConsent,
    initializeChat,
    clearChat,
    labels,
    lang
  };
}
