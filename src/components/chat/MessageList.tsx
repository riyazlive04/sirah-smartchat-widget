import { useEffect, useRef } from 'react';
import type { Message, QuickReply } from '@/types/chat';
import { cn } from '@/lib/utils';
import { TypingIndicator } from './TypingIndicator';
import { QuickReplies } from './QuickReplies';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  lang: 'en' | 'ta';
  onQuickReply: (value: string) => void;
}

export function MessageList({ messages, isTyping, lang, onQuickReply }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Get the last bot message's quick replies (only show for the most recent bot message)
  const lastBotMessage = [...messages].reverse().find(m => m.role === 'bot');
  const showQuickReplies = lastBotMessage?.quickReplies && 
    messages[messages.length - 1]?.role === 'bot';

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-scrollbar">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex animate-message-appear",
            message.role === 'user' ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "max-w-[80%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
              message.role === 'user'
                ? "chat-bubble-user"
                : "chat-bubble-bot"
            )}
          >
            {message.content}
          </div>
        </div>
      ))}
      
      {isTyping && (
        <div className="flex justify-start">
          <TypingIndicator />
        </div>
      )}

      {showQuickReplies && !isTyping && (
        <div className="flex justify-start">
          <div className="max-w-[90%]">
            <QuickReplies
              replies={lastBotMessage.quickReplies!}
              lang={lang}
              onSelect={onQuickReply}
            />
          </div>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
}
