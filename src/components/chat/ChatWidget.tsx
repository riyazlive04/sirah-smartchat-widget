import { useState, useCallback } from 'react';
import { ChatBubble } from './ChatBubble';
import { ChatWindow } from './ChatWindow';
import { useChatConfig } from '@/hooks/useChatConfig';
import { useChatbot } from '@/hooks/useChatbot';
import type { ClientConfig } from '@/types/chat';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { config, businessInfo, loading, error } = useChatConfig();
  const [currentConfig, setCurrentConfig] = useState<ClientConfig | null>(null);

  // Use local config state to handle language changes
  const activeConfig = currentConfig || config;

  const {
    messages,
    chatState,
    isTyping,
    sendMessage,
    handleConsent,
    initializeChat,
    labels,
    lang
  } = useChatbot(activeConfig, businessInfo);

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

  return (
    <>
      <ChatBubble isOpen={isOpen} onClick={toggleChat} />
      
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
        onClose={toggleChat}
        onSendMessage={sendMessage}
        onConsent={handleConsent}
        onToggleLanguage={toggleLanguage}
        onInit={initializeChat}
      />
    </>
  );
}
