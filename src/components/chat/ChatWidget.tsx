import { useState, useCallback, useEffect } from 'react';
import { ChatBubble } from './ChatBubble';
import { ChatWindow } from './ChatWindow';
import { useChatConfig } from '@/hooks/useChatConfig';
import { useChatbot } from '@/hooks/useChatbot';
import { useChatSounds } from '@/hooks/useChatSounds';
import type { ClientConfig, Attachment } from '@/types/chat';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { config, businessInfo, loading, error } = useChatConfig();
  const [currentConfig, setCurrentConfig] = useState<ClientConfig | null>(null);
  
  const { isMuted, toggleMute, playMessageSent, playMessageReceived } = useChatSounds();

  // Use local config state to handle language changes
  const activeConfig = currentConfig || config;

  const {
    messages,
    chatState,
    isTyping,
    sendMessage,
    handleConsent,
    initializeChat,
    clearChat,
    labels,
    lang
  } = useChatbot(activeConfig, businessInfo, {
    onMessageSent: playMessageSent,
    onMessageReceived: playMessageReceived
  });

  // Apply custom branding colors from config
  useEffect(() => {
    if (config?.theme) {
      const root = document.documentElement;
      
      if (config.theme.primaryColor) {
        // Convert hex to HSL for CSS variables
        const hsl = hexToHSL(config.theme.primaryColor);
        if (hsl) {
          root.style.setProperty('--primary', hsl);
        }
      }
      
      if (config.theme.secondaryColor) {
        const hsl = hexToHSL(config.theme.secondaryColor);
        if (hsl) {
          root.style.setProperty('--secondary', hsl);
        }
      }
      
      if (config.theme.accentColor) {
        const hsl = hexToHSL(config.theme.accentColor);
        if (hsl) {
          root.style.setProperty('--accent', hsl);
        }
      }
    }
  }, [config]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const toggleLanguage = useCallback(() => {
    if (!config) return;
    
    const newLang = (activeConfig?.language === 'en' ? 'ta' : 'en') as 'en' | 'ta';
    setCurrentConfig({
      ...config,
      language: newLang
    });
  }, [config, activeConfig]);

  const handleSendMessage = useCallback((message: string, attachments?: Attachment[]) => {
    sendMessage(message, attachments);
  }, [sendMessage]);

  const handleClearChat = useCallback(() => {
    clearChat();
    // Re-initialize with welcome message after clearing
    setTimeout(() => {
      initializeChat();
    }, 100);
  }, [clearChat, initializeChat]);

  if (loading) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="w-14 h-14 rounded-full bg-primary/20 animate-pulse" />
      </div>
    );
  }

  if (error || !config || !businessInfo) {
    console.error('Chat widget error:', error);
    return null;
  }

  const position = config.theme?.position || 'bottom-right';

  return (
    <>
      <ChatBubble 
        isOpen={isOpen} 
        onClick={toggleChat} 
        position={position}
      />
      
      <ChatWindow
        isOpen={isOpen}
        messages={messages}
        isTyping={isTyping}
        chatState={chatState}
        botName={config.botName}
        businessName={businessInfo.businessName}
        labels={labels}
        currentLang={lang}
        enableTamil={config.enableTamil}
        position={position}
        isMuted={isMuted}
        onClose={toggleChat}
        onSendMessage={handleSendMessage}
        onConsent={handleConsent}
        onToggleLanguage={toggleLanguage}
        onToggleMute={toggleMute}
        onClearChat={handleClearChat}
        onInit={initializeChat}
      />
    </>
  );
}

// Helper function to convert hex to HSL
function hexToHSL(hex: string): string | null {
  try {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch {
    return null;
  }
}
