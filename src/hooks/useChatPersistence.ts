import { useState, useEffect, useCallback } from 'react';
import type { Message, ChatState, LeadData } from '@/types/chat';

const STORAGE_KEY = 'sirah_smartchat_history';
const STORAGE_VERSION = 1;

interface StoredChatData {
  version: number;
  messages: Array<{
    id: string;
    role: 'user' | 'bot';
    content: string;
    timestamp: string;
  }>;
  chatState: ChatState;
  pendingLead: Partial<LeadData>;
  leadField: 'name' | 'phone' | 'email' | null;
  lastUpdated: string;
}

export function useChatPersistence(businessName?: string) {
  const storageKey = businessName 
    ? `${STORAGE_KEY}_${businessName.toLowerCase().replace(/\s+/g, '_')}`
    : STORAGE_KEY;

  const loadStoredData = useCallback((): StoredChatData | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;
      
      const data: StoredChatData = JSON.parse(stored);
      
      // Check version compatibility
      if (data.version !== STORAGE_VERSION) {
        localStorage.removeItem(storageKey);
        return null;
      }
      
      // Check if data is older than 24 hours
      const lastUpdated = new Date(data.lastUpdated);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        localStorage.removeItem(storageKey);
        return null;
      }
      
      return data;
    } catch {
      return null;
    }
  }, [storageKey]);

  const saveData = useCallback((
    messages: Message[],
    chatState: ChatState,
    pendingLead: Partial<LeadData>,
    leadField: 'name' | 'phone' | 'email' | null
  ) => {
    try {
      const data: StoredChatData = {
        version: STORAGE_VERSION,
        messages: messages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp.toISOString()
        })),
        chatState,
        pendingLead,
        leadField,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save chat history:', error);
    }
  }, [storageKey]);

  const clearData = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const parseStoredMessages = useCallback((stored: StoredChatData): Message[] => {
    return stored.messages.map(m => ({
      ...m,
      timestamp: new Date(m.timestamp)
    }));
  }, []);

  return {
    loadStoredData,
    saveData,
    clearData,
    parseStoredMessages
  };
}
