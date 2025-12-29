import { useEffect, useRef } from 'react';
import type { Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

export function MessageList({ messages, isTyping }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

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
      
      <div ref={bottomRef} />
    </div>
  );
}
