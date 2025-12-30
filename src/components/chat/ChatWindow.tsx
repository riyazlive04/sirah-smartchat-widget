import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ConsentPrompt } from './ConsentPrompt';
import type { Message, Labels, ChatState, Attachment } from '@/types/chat';

interface ChatWindowProps {
  isOpen: boolean;
  messages: Message[];
  isTyping: boolean;
  chatState: ChatState;
  botName: string;
  businessName?: string;
  labels?: Labels;
  currentLang: 'en' | 'ta';
  enableTamil: boolean;
  position?: 'bottom-right' | 'bottom-left';
  isMuted?: boolean;
  onClose: () => void;
  onSendMessage: (message: string, attachments?: Attachment[]) => void;
  onConsent: (agreed: boolean) => void;
  onToggleLanguage: () => void;
  onToggleMute?: () => void;
  onClearChat?: () => void;
  onInit: () => void;
}

export function ChatWindow({
  isOpen,
  messages,
  isTyping,
  chatState,
  botName,
  businessName,
  labels,
  currentLang,
  enableTamil,
  position = 'bottom-right',
  isMuted = false,
  onClose,
  onSendMessage,
  onConsent,
  onToggleLanguage,
  onToggleMute,
  onClearChat,
  onInit
}: ChatWindowProps) {
  useEffect(() => {
    if (isOpen) {
      onInit();
    }
  }, [isOpen, onInit]);

  if (!isOpen) return null;

  const showConsentPrompt = chatState === 'consent-pending';
  const inputDisabled = chatState === 'consent-pending';

  return (
    <div
      className={cn(
        "fixed bottom-24 z-50",
        position === 'bottom-right' ? 'right-6' : 'left-6',
        "w-[360px] max-w-[calc(100vw-48px)]",
        "h-[500px] max-h-[calc(100vh-120px)]",
        "bg-card rounded-2xl",
        "shadow-widget",
        "flex flex-col overflow-hidden",
        "border border-border",
        "animate-slide-up"
      )}
    >
      <ChatHeader
        botName={botName}
        businessName={businessName}
        onClose={onClose}
        onToggleLanguage={onToggleLanguage}
        onClearChat={onClearChat}
        onToggleMute={onToggleMute}
        currentLang={currentLang}
        enableTamil={enableTamil}
        isMuted={isMuted}
      />
      
      <MessageList 
        messages={messages} 
        isTyping={isTyping} 
        lang={currentLang}
        onQuickReply={(value) => onSendMessage(value)}
      />
      
      {showConsentPrompt ? (
        <ConsentPrompt
          onAgree={() => onConsent(true)}
          onDecline={() => onConsent(false)}
          labels={labels}
        />
      ) : (
        <MessageInput
          onSend={onSendMessage}
          labels={labels}
          disabled={inputDisabled}
        />
      )}
      
      {/* Powered by footer */}
      <div className="px-4 py-2 text-center border-t border-border bg-muted/30">
        <p className="text-[10px] text-muted-foreground">
          {labels?.poweredBy || 'Powered by Sirah SmartChat'}
        </p>
      </div>
    </div>
  );
}
