import { useCallback, useMemo } from 'react';
import type { BusinessInfo, LocalizedString, WorkingHoursConfig } from '@/types/chat';

interface WorkingHoursResult {
  isOpen: boolean;
  currentDay: string;
  opensAt?: string;
  closesAt?: string;
  nextOpenDay?: string;
}

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

export function useWorkingHours(businessInfo: BusinessInfo | null) {
  const workingHours = useMemo(() => {
    if (!businessInfo?.workingHours) return null;
    
    // Check if it's the new format with schedule
    const wh = businessInfo.workingHours as any;
    if (wh.schedule) {
      return wh as WorkingHoursConfig;
    }
    
    // Legacy format - just text
    return null;
  }, [businessInfo]);

  const checkIfOpen = useCallback((): WorkingHoursResult => {
    const now = new Date();
    const currentDay = DAYS[now.getDay()];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const result: WorkingHoursResult = {
      isOpen: true, // Default to open if no schedule configured
      currentDay
    };

    if (!workingHours?.schedule) {
      return result;
    }

    const todaySchedule = workingHours.schedule[currentDay];

    // Check if closed today
    if (!todaySchedule) {
      result.isOpen = false;
      
      // Find next open day
      for (let i = 1; i <= 7; i++) {
        const nextDayIndex = (now.getDay() + i) % 7;
        const nextDay = DAYS[nextDayIndex];
        const nextSchedule = workingHours.schedule[nextDay];
        if (nextSchedule) {
          result.nextOpenDay = nextDay;
          result.opensAt = nextSchedule.open;
          break;
        }
      }
      
      return result;
    }

    // Parse open/close times
    const openTime = parseTime(todaySchedule.open);
    const closeTime = parseTime(todaySchedule.close);
    const openMinutes = openTime.hours * 60 + openTime.minutes;
    const closeMinutes = closeTime.hours * 60 + closeTime.minutes;

    result.opensAt = todaySchedule.open;
    result.closesAt = todaySchedule.close;

    // Check if within working hours
    if (currentTime < openMinutes || currentTime >= closeMinutes) {
      result.isOpen = false;
      
      // If before opening time today
      if (currentTime < openMinutes) {
        result.nextOpenDay = currentDay;
      } else {
        // Find next open day
        for (let i = 1; i <= 7; i++) {
          const nextDayIndex = (now.getDay() + i) % 7;
          const nextDay = DAYS[nextDayIndex];
          const nextSchedule = workingHours.schedule[nextDay];
          if (nextSchedule) {
            result.nextOpenDay = nextDay;
            result.opensAt = nextSchedule.open;
            break;
          }
        }
      }
    }

    return result;
  }, [workingHours]);

  const getWorkingHoursText = useCallback((lang: 'en' | 'ta'): string => {
    if (!businessInfo?.workingHours) return '';
    
    const wh = businessInfo.workingHours as any;
    
    // New format
    if (wh.text) {
      return getLocalizedText(wh.text, lang);
    }
    
    // Legacy format
    return getLocalizedText(businessInfo.workingHours as LocalizedString, lang);
  }, [businessInfo]);

  const getOutsideHoursMessage = useCallback((lang: 'en' | 'ta'): string => {
    const status = checkIfOpen();
    
    if (status.isOpen) return '';

    if (lang === 'ta') {
      if (status.nextOpenDay) {
        const dayName = getDayNameTamil(status.nextOpenDay);
        return `தற்போது மூடப்பட்டுள்ளது. ${dayName} ${status.opensAt} மணிக்கு திறக்கும். உங்கள் விவரங்களை விடுங்கள், நாங்கள் உங்களை மீண்டும் அழைப்போம்.`;
      }
      return 'தற்போது மூடப்பட்டுள்ளது. உங்கள் விவரங்களை விடுங்கள், நாங்கள் உங்களை மீண்டும் அழைப்போம்.';
    }

    if (status.nextOpenDay) {
      const dayName = status.nextOpenDay.charAt(0).toUpperCase() + status.nextOpenDay.slice(1);
      return `We're currently closed. We open on ${dayName} at ${status.opensAt}. Leave your details and we'll call you back!`;
    }
    
    return "We're currently closed. Leave your details and we'll call you back during business hours!";
  }, [checkIfOpen]);

  return {
    checkIfOpen,
    getWorkingHoursText,
    getOutsideHoursMessage,
    isConfigured: !!workingHours?.schedule
  };
}

function getLocalizedText(text: LocalizedString | string, lang: 'en' | 'ta'): string {
  if (typeof text === 'string') return text;
  return text[lang] || text.en;
}

function getDayNameTamil(day: string): string {
  const days: Record<string, string> = {
    sunday: 'ஞாயிறு',
    monday: 'திங்கள்',
    tuesday: 'செவ்வாய்',
    wednesday: 'புதன்',
    thursday: 'வியாழன்',
    friday: 'வெள்ளி',
    saturday: 'சனி'
  };
  return days[day] || day;
}
