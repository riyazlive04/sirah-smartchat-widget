import { useCallback } from 'react';
import type { IntentLevel, BusinessInfo, LocalizedString } from '@/types/chat';

interface IntentResult {
  level: IntentLevel;
  type: 'appointment' | 'pricing' | 'enquiry' | 'service' | 'general' | null;
  confidence: number;
}

const HIGH_INTENT_KEYWORDS = [
  // English
  'appointment', 'book', 'booking', 'schedule', 'visit', 'consultation',
  'price', 'cost', 'pricing', 'fee', 'charge', 'how much', 'rates',
  'buy', 'purchase', 'order', 'proceed', 'confirm', 'yes', 'ready',
  // Tamil
  'முன்பதிவு', 'சந்திப்பு', 'விலை', 'செலவு', 'கட்டணம்'
];

const MEDIUM_INTENT_KEYWORDS = [
  // English
  'service', 'services', 'treatment', 'treatments', 'options', 'available',
  'offer', 'provide', 'doctor', 'specialist', 'information', 'details',
  'tell me', 'know more', 'interested', 'considering',
  // Tamil
  'சேவை', 'சிகிச்சை', 'மருத்துவர்', 'தகவல்'
];

const LOW_INTENT_KEYWORDS = [
  // English
  'hello', 'hi', 'hey', 'timing', 'hours', 'location', 'where', 'address',
  'contact', 'phone', 'email', 'thanks', 'thank you', 'okay', 'ok',
  // Tamil
  'வணக்கம்', 'நேரம்', 'எங்கே', 'முகவரி', 'நன்றி'
];

export function useIntentDetection() {
  const detectIntent = useCallback((message: string, businessInfo?: BusinessInfo | null): IntentResult => {
    const normalized = message.toLowerCase().trim();
    
    // Count keyword matches for each level
    const highMatches = HIGH_INTENT_KEYWORDS.filter(k => normalized.includes(k)).length;
    const mediumMatches = MEDIUM_INTENT_KEYWORDS.filter(k => normalized.includes(k)).length;
    const lowMatches = LOW_INTENT_KEYWORDS.filter(k => normalized.includes(k)).length;

    // Check for specific intent types
    let type: IntentResult['type'] = null;
    
    if (businessInfo?.intents) {
      for (const [intentName, intent] of Object.entries(businessInfo.intents)) {
        for (const keyword of intent.keywords) {
          if (normalized.includes(keyword.toLowerCase())) {
            type = intentName as 'appointment' | 'pricing' | 'enquiry';
            break;
          }
        }
        if (type) break;
      }
    }

    // Check for service-related queries
    if (!type && businessInfo?.services) {
      for (const service of businessInfo.services) {
        const serviceName = getLocalizedText(service.name, 'en').toLowerCase();
        if (normalized.includes(serviceName.split(' ')[0])) {
          type = 'service';
          break;
        }
      }
    }

    // Determine intent level
    let level: IntentLevel = 'low';
    let confidence = 0.3;

    if (highMatches > 0) {
      level = 'high';
      confidence = Math.min(0.9, 0.5 + highMatches * 0.15);
    } else if (mediumMatches > 0) {
      level = 'medium';
      confidence = Math.min(0.7, 0.4 + mediumMatches * 0.1);
    } else if (lowMatches > 0) {
      level = 'low';
      confidence = Math.min(0.5, 0.3 + lowMatches * 0.1);
    }

    // Boost confidence if we detected a specific intent type
    if (type === 'appointment' || type === 'pricing') {
      level = 'high';
      confidence = Math.max(confidence, 0.8);
    }

    return { level, type, confidence };
  }, []);

  const shouldTriggerLeadCapture = useCallback((
    intentLevel: IntentLevel,
    highIntentCount: number,
    buttonClicked?: string
  ): boolean => {
    // Trigger on high intent
    if (intentLevel === 'high') return true;
    
    // Trigger if booking-related button was clicked
    if (buttonClicked) {
      const bookingKeywords = ['book', 'appointment', 'proceed', 'yes', 'confirm', 'pricing', 'price'];
      if (bookingKeywords.some(k => buttonClicked.toLowerCase().includes(k))) {
        return true;
      }
    }

    // Trigger after 2+ high-intent queries
    if (highIntentCount >= 2) return true;

    return false;
  }, []);

  return { detectIntent, shouldTriggerLeadCapture };
}

function getLocalizedText(text: LocalizedString | string, lang: 'en' | 'ta'): string {
  if (typeof text === 'string') return text;
  return text[lang] || text.en;
}
